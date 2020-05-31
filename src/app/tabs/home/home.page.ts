import { Component, OnInit } from "@angular/core";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  loadedReceipts: Receipt[];
  total: number;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.receiptService.receipts.subscribe((receipts) => {
      this.loadedReceipts = receipts;
    });
  }

  ionViewWillEnter() {
    this.total = this.receiptService.total();
  }

  onDelete(receiptId: string, slidingItem: IonItemSliding) {
    this.loadingCtrl.create({message: 'Cancelling...'}).then(loadingEl => {
      loadingEl.present()
      this.receiptService.deleteReceipt(receiptId).subscribe(() => {
        this.loadingCtrl.dismiss()
      });
    })
    slidingItem.close();
  }
  onEdit(receiptId: string, slidingItem: IonItemSliding) {
    this.router.navigate(["./", "tabs", "home", "edit", receiptId]);
    slidingItem.close();
  }
  onDetail(receiptId: string) {
    this.router.navigate(["./", "tabs", "home", receiptId]);
  }
}
