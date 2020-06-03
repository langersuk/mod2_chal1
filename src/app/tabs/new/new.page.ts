import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-new",
  templateUrl: "./new.page.html",
  styleUrls: ["./new.page.scss"],
})
export class NewPage implements OnInit {
  form: FormGroup;
  timeStamp: Date;
  image: string;

  constructor(private receiptService: ReceiptService, private router: Router) {
    this.form = new FormGroup({
      cost: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      image: new FormControl(null),
    });
  }

  ngOnInit() {}

  onImagePicked(imageUrl) {
    this.form.patchValue({ image: imageUrl });
    this.timeStamp = new Date();
    if (typeof imageUrl === "string") {
      this.image = imageUrl;
    } else {
      console.log("CameraPhoto");
      this.image = imageUrl.webPath;
    }
  }

  onSubmitReceipt() {
    let newReceipt: Receipt = new Receipt(
      this.form.value.cost,
      this.image,
      this.timeStamp.toISOString()
    );
    this.receiptService.addReceipt(newReceipt).subscribe();
    this.form.reset();
    this.timeStamp = null;
    this.image = null
    this.router.navigateByUrl("/tabs/home");
  }
}
