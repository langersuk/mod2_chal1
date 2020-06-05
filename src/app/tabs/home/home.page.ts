import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import {
  IonItemSliding,
  LoadingController,
  AlertController,
} from "@ionic/angular";
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
  firstReceipt = false;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
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
    if (!this.loadedReceipts[0]) {
      this.alertCtrl
        .create({
          header: "No receipts",
          message: "Click on the New tab at the bottom to get started",
          buttons: ["Okay"],
        })
        .then((alertEl) => {
          alertEl.present();
          this.firstReceipt = true;
        });
    }
  }

  ionViewWillEnter() {
    if (this.loadedReceipts && this.firstReceipt) {
      this.alertCtrl
        .create({
          header: "Your first receipt!",
          message:
            "Click on the receipt to bring up details. Swipe left to edit. Swipe right to delete. You can add more receipts by clicking on New",
          buttons: ["Okay"],
        })
        .then((alertEl) => {
          alertEl.present();
          this.firstReceipt = false;
        });
    }
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
