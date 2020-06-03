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
