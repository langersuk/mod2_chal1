import { Receipt } from "./receipt.model";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { take, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import {
  Filesystem,
  FilesystemDirectory,
  FilesystemEncoding,
  Capacitor,
} from "@capacitor/core";
@Injectable({ providedIn: "root" })
export class ReceiptService {
  private _receipts = new BehaviorSubject<Receipt[]>([
    new Receipt(
      1.99,
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg",
      new Date(2018, 11, 24)
    ),
    new Receipt(
      7.99,
      "https://live.staticflickr.com/2596/4139352235_bbfa7e37fb_b.jpg",
      new Date(2019, 1, 12)
    ),
    new Receipt(
      3.99,
      "https://live.staticflickr.com/3294/2623977987_8937dd3bc7_b.jpg",
      new Date(2017, 5, 19)
    ),
  ]);

  get receipts() {
    return this._receipts.asObservable();
  }

  constructor(private http: HttpClient) {}

  total() {
    let total = 0;
    this.receipts.pipe(take(1)).subscribe((receipts) => {
      receipts.forEach((receipt: Receipt) => {
        total += +receipt.cost;
      });
    });
    return total;
  }

  fetchReceipts() {
    return Filesystem.readFile({
      path: "receipts/receipts.json",
      directory: FilesystemDirectory.Data,
      encoding: FilesystemEncoding.UTF8,
    });
  }

  // fetchImage(imageName) {
  //   return Filesystem.getUri({
  //     path: "receipts/receipts.json",
  //     directory: FilesystemDirectory.Data,
  //   }).then((resData) => {
  //     Capacitor.convertFileSrc(resData.uri);
  //   });
  // }

  addReceipt(newReceipt: Receipt, image) {
    return Filesystem.writeFile({
      path: "receipts/" + newReceipt.timeStamp + ".jpg",
      data: image,
      directory: FilesystemDirectory.Data,
      encoding: FilesystemEncoding.UTF8,
    })
      .then((filePath) => {
        console.log(filePath.uri);
        newReceipt.imageUri = Capacitor.convertFileSrc(filePath.uri);
        console.log(newReceipt.imageUri);
        Filesystem.appendFile({
          path: "receipts/receipts.json",
          data: JSON.stringify(newReceipt),
          directory: FilesystemDirectory.Data,
          encoding: FilesystemEncoding.UTF8,
        });
      })
      .then(() => {
        this.addReceipt2(newReceipt).subscribe();
      });
  }

  addReceipt2(newReceipt: Receipt) {
    console.log("hi");
    return this.receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        this._receipts.next(receipts.concat(newReceipt));
        console.log(this._receipts);
      })
    );
  }

  deleteReceipt(receiptId: string) {
    return this._receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        this._receipts.next(
          receipts.filter(
            (receipt) => receipt.timeStamp.toString() !== receiptId
          )
        );
      })
    );
  }
}
