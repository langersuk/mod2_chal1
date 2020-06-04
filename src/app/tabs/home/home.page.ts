import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit, OnDestroy {
  loadedReceipts: Receipt[];
  total: number;
  image = null;
  private receiptSub: Subscription;
  private initSub: Subscription;
  isLoading = false;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.initSub = this.receiptService.receiptsInitialised.subscribe(
      (value) => {
        this.isLoading = !value;
        if (value) {
          this.loadReceipts();
        } else {
          this.receiptService.readdir();
        }
      }
    );
  }

  loadReceipts() {
    this.receiptSub = this.receiptService.receipts.subscribe((receipts) => {
      this.loadedReceipts = receipts;
      this.total = this.receiptService.total();
    });
  }

  onDelete(receipt: Receipt, slidingItem: IonItemSliding) {
    let receiptId = receipt.timeStamp;
    this.loadingCtrl.create({ message: "Deleting..." }).then((loadingEl) => {
      loadingEl.present();
      this.receiptService
        .deleteReceipt(receiptId)
        .pipe(take(1))
        .subscribe(() => {
          this.loadingCtrl.dismiss();
        });
    });
    slidingItem.close();
  }
  onEdit(receipt: Receipt, slidingItem: IonItemSliding) {
    let receiptId = receipt.timeStamp;
    this.router.navigate(["./", "tabs", "home", "edit", receiptId]);
    slidingItem.close();
  }

  ngOnDestroy() {
    if (this.receiptSub) {
      this.receiptSub.unsubscribe();
    }
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }
}
