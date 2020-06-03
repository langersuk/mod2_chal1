import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../../receipt.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Receipt } from "../../receipt.model";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"],
})
export class EditPage implements OnInit {
  form: FormGroup;
  timeStamp: string;
  image: string;
  isLoading = false;
  receipt: Receipt;
  receiptId: string;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.form = new FormGroup({
      cost: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      image: new FormControl(null),
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("receiptId")) {
        return this.navCtrl.navigateBack("/tabs/home");
      }
      this.isLoading = true;
      this.receiptId = paramMap.get("receiptId");
      this.receiptService.receipts.subscribe((receipts) => {
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
}
