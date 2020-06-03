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
  image = null;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.receiptService.readdir();
    this.receiptService.receipts.subscribe((receipts) => {
      this.loadedReceipts = receipts;
      this.total = this.receiptService.total();
    });
  }

  // ionViewWillEnter() {
  //   this.total = this.receiptService.total();
  // }

  onDelete(receipt: Receipt, slidingItem: IonItemSliding) {
    let receiptId = receipt.timeStamp;
    this.loadingCtrl.create({ message: "Deleting..." }).then((loadingEl) => {
      loadingEl.present();
      this.receiptService.deleteReceipt(receiptId).subscribe(() => {
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

}
