import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../../receipt.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Receipt } from "../../receipt.model";
import { NavController, AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"],
})
export class EditPage implements OnInit, OnDestroy {
  form: FormGroup;
  timeStamp: string;
  image: string;
  isLoading = false;
  receipt: Receipt;
  receiptId: string;
  private initSub: Subscription;
  private routeSub: Subscription;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.form = new FormGroup({
      cost: new FormControl(null, {
        updateOn: "blur",
        validators: [
          Validators.required,
          Validators.pattern(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/),
        ],
      }),
      image: new FormControl(null),
    });
  }

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
    this.routeSub = this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("receiptId")) {
        return this.navCtrl.navigateBack("/tabs/home");
      }
      this.isLoading = true;
      this.receiptId = paramMap.get("receiptId");
      this.receiptService.receipts.pipe(take(1)).subscribe((receipts) => {
        let filteredReceipts = receipts.filter(
          (receipt) => receipt.timeStamp === this.receiptId
        )[0];
        if (filteredReceipts) {
          this.receipt = filteredReceipts;
          this.form.patchValue({ cost: this.receipt.cost });
          this.form.patchValue({ image: this.receipt.imageUri });
          this.image = this.receipt.imageUri;
          this.timeStamp = this.receipt.timeStamp;
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

  onImagePicked(imageUrl) {
    this.form.patchValue({ image: imageUrl });
    let newTime = new Date();
    this.timeStamp = newTime.toISOString();
    if (typeof imageUrl === "string") {
      this.image = imageUrl;
    } else {
      console.log("CameraPhoto");
      this.image = imageUrl.webPath;
    }
  }

  onSubmitReceipt() {
    let receiptToUpdate: Receipt = new Receipt(
      this.form.value.cost,
      this.image,
      this.timeStamp
    );
    this.receiptService
      .updateReceipt(receiptToUpdate, this.receiptId)
      .subscribe();
    this.router.navigateByUrl("/tabs/home");
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
