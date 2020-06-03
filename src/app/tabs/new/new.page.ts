import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { Router } from "@angular/router";
import {
  Filesystem,
  FilesystemDirectory,
  FilesystemEncoding,
} from "@capacitor/core";

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
      console.log("string");
      const path = "/receipts/" + this.timeStamp.toISOString() + ".jpg";
      return Filesystem.writeFile({
        data: imageUrl,
        path: path,
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8,
      })
        .then((file) => {
          this.image = path;
          console.log(file);
          console.log(this.image);
        })
        .then(() => {
          Filesystem.readFile({
            directory: FilesystemDirectory.Data,
            path: this.image,
            encoding: FilesystemEncoding.UTF8,
          }).then((file) => {
            this.image = file.data;
          });
        });
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
    this.router.navigateByUrl("/tabs/home");
  }
}
