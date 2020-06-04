import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, AlertController } from "@ionic/angular";
import { take } from "rxjs/operators";
import { ReceiptService } from "../../receipt.service";
import { Receipt } from "../../receipt.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.page.html",
  styleUrls: ["./detail.page.scss"],
})
export class DetailPage implements OnInit, OnDestroy {
  id: string;
  receipt: Receipt = null;
  private initSub: Subscription;
  isLoading = false;

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.initSub = this.receiptService.receiptsInitialised.subscribe(
      (value) => {
        this.isLoading = !value;
        if (value) {
          this.loadReceipt();
        } else {
          this.receiptService.readdir();
        }
      }
    );
  }

  loadReceipt() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("receiptId")) {
        return this.navCtrl.navigateBack("/tabs/home");
      }
      this.isLoading = true;
      const receiptId = paramMap.get("receiptId");

      this.receiptService.receipts.pipe(take(1)).subscribe((receipts) => {
        let filteredReceipts = receipts.filter(
          (receipt) => receipt.timeStamp === receiptId
        )[0];
        if (filteredReceipts) {
          this.receipt = filteredReceipts;
        } else {
          this.alertCtrl
            .create({
              message: "Receipt not found",
              buttons: [{ text: "Okay", role: "cancel" }],
            })
            .then((alertEl) => {
              alertEl.present();
            });
          return this.navCtrl.navigateBack("/tabs/home");
        }
        this.isLoading = false;
      });
    });
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }
}
