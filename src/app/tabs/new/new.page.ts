import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { Router } from "@angular/router";

function base64toBlob(base64Data, contentType) {
  contentType = contentType || "";
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: "app-new",
  templateUrl: "./new.page.html",
  styleUrls: ["./new.page.scss"],
})
export class NewPage implements OnInit {
  form: FormGroup;
  timeStamp: Date = null;
  image;

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

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === "string") {
      try {
        imageFile = base64toBlob(
          imageData.replace("data:image/jpeg;base64,", ""),
          "image/jpeg"
        );
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
    this.image = imageFile;
    this.timeStamp = new Date();
  }

  onSubmitReceipt() {
    let newReceipt: Receipt = new Receipt(
      this.form.value.cost,
      this.image.name,
      this.timeStamp
    );
    this.receiptService.addReceipt(newReceipt, this.image).then(() => {
      this.router.navigateByUrl("/tabs/home");
    });

    // this.receiptService.fetchReceipts().then((data) => {
    //   console.log(data);
    // });

    // this.receiptService.fetchImage("Hk_P-plate.svg (1).jpg").then((result) => {
    //   console.log(result);
    // });
    // this.receiptService.fileRead()
    // return this.receiptService.addReceipt(newReceipt).subscribe();
  }
}