import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "app-new",
  templateUrl: "./new.page.html",
  styleUrls: ["./new.page.scss"],
})
export class NewPage implements OnInit, OnDestroy {
  form: FormGroup;
  timeStamp: Date;
  image: string;
  private initSub: Subscription;
  isLoading = false;

  constructor(private receiptService: ReceiptService, private router: Router) {
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
        if (!value) {
          this.receiptService.readdir();
        }
      }
    );
  }

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
    this.receiptService.addReceipt(newReceipt).pipe(take(1)).subscribe();
    this.form.reset();
    this.timeStamp = null;
    this.image = null;
    this.router.navigateByUrl("/tabs/home");
  }

  ngOnDestroy() {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }
}
