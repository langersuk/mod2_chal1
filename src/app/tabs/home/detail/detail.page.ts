import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { switchMap, take, tap } from "rxjs/operators";
import { ReceiptService } from "../../receipt.service";
import { Receipt } from "../../receipt.model";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.page.html",
  styleUrls: ["./detail.page.scss"],
})
export class DetailPage implements OnInit {
  id: string;
  receipt: Receipt = null;
  isLoading = false;

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("receiptId")) {
        return this.navCtrl.navigateBack("/tabs/home");
      }
      this.isLoading = true;
      const receiptId = paramMap.get("receiptId");

      this.receiptService.receipts.subscribe((receipts) => {
        let filteredReceipts = receipts.filter(
          (receipt) => receipt.timeStamp === receiptId
        )[0];
        if (filteredReceipts) {
          this.receipt = filteredReceipts;
        } else {
          return this.navCtrl.navigateBack("/tabs/home");
        }
        this.isLoading = false;
      });
    });
  }
}
