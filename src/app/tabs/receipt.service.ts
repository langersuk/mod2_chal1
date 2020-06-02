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
  private _receipts = new BehaviorSubject<Receipt[]>([]);
  // new Receipt(
  //   1.99,
  //   "https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg",
  //   new Date(2018, 11, 24).toDateString()
  // ),
  // new Receipt(
  //   7.99,
  //   "https://live.staticflickr.com/2596/4139352235_bbfa7e37fb_b.jpg",
  //   new Date(2019, 1, 12).toDateString()
  // ),
  // new Receipt(
  //   3.99,
  //   "https://live.staticflickr.com/3294/2623977987_8937dd3bc7_b.jpg",
  //   new Date(2017, 5, 19).toDateString()
  // ),

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
    const receipts: Receipt[] = [];
    Filesystem.readFile({
      path: "receipts/receipts.json",
      directory: FilesystemDirectory.Data,
      encoding: FilesystemEncoding.UTF8,
    })
      .then((file) => {
        console.log(file.data);
        const data = JSON.parse(file.data);
        for (const key in data) {
          receipts.push(
            new Receipt(data[key].cost, data[key].imageUri, data[key].timeStamp)
          );
        }
      })
      .then(() => this._receipts.next(receipts));
  }

  onChange() {
    return this.receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        const data = JSON.stringify(receipts);
        Filesystem.writeFile({
          data: data,
          path: "receipts/receipts.json",
          directory: FilesystemDirectory.Data,
          encoding: FilesystemEncoding.UTF8,
        });
      })
    );
  }

  addReceipt(newReceipt: Receipt) {
    let data: Receipt[] = [];
    return this.receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        this._receipts.next(receipts.concat(newReceipt));
        this.onChange().subscribe();
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

  verifyIfExists(ITEM, LIST) {
    let verification = false;
    for (let i = 0; i < LIST.length; i++) {
      if (LIST[i] === ITEM) {
        verification = true;
        break;
      }
    }
    return verification;
  }

  async readdir() {
    try {
      let dir = await Filesystem.readdir({
        path: "receipts",
        directory: FilesystemDirectory.Data,
      });
      if (this.verifyIfExists("receipts.json", dir.files)) {
        console.log("'receipts.json' exists");
        this.fetchReceipts();
      } else {
        Filesystem.writeFile({
          data: "",
          path: "receipts/receipts.json",
          directory: FilesystemDirectory.Data,
          encoding: FilesystemEncoding.UTF8,
        });
        console.log("Creating 'receipts.json' in 'receipts/'");
      }
    } catch (e) {
      console.log("Unable to read dir: " + e);
      Filesystem.writeFile({
        data: "",
        path: "receipts/receipts.json",
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8,
      });
      console.log("Creating 'receipts.json'");
    }
  }
}
