import { Receipt } from "./receipt.model";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { take, tap } from "rxjs/operators";
import {
  Filesystem,
  FilesystemDirectory,
  FilesystemEncoding,
} from "@capacitor/core";
@Injectable({ providedIn: "root" })
export class ReceiptService {
  private _receipts = new BehaviorSubject<Receipt[]>([]);
  public receiptsInitialised = new BehaviorSubject<boolean>(false);

  get receipts() {
    return this._receipts.asObservable();
  }

  constructor() {}

  total() {
    let total = 0;
    this.receipts.pipe(take(1)).subscribe((receipts) => {
      receipts.forEach((receipt: Receipt) => {
        total += receipt.cost;
      });
    });
    total = +total.toFixed(2);
    return total;
  }

  fetchReceipts() {
    const receipts: Receipt[] = [];
    return Filesystem.readFile({
      path: "receipts/receipts.json",
      directory: FilesystemDirectory.Data,
      encoding: FilesystemEncoding.UTF8,
    })
      .then((file) => {
        try {
          if (!file.data) throw "File is empty";
          const data = JSON.parse(file.data);
          for (const key in data) {
            receipts.push(
              new Receipt(
                data[key].cost,
                data[key].imageUri,
                data[key].timeStamp
              )
            );
          }
        } catch (err) {
          console.log(err);
        }
      })
      .then(() => {
        this._receipts.next(receipts);
        this.receiptsInitialised.next(true);
      });
  }

  updateCache() {
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
    return this.receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        this._receipts.next(receipts.concat(newReceipt));
        this.updateCache().subscribe();
      })
    );
  }

  updateReceipt(receiptToUpdate: Receipt, receiptId: string) {
    let updatedReceipts: Receipt[];
    return this.receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        const updatedReceiptIndex = receipts.findIndex(
          (rt) => rt.timeStamp === receiptId
        );
        updatedReceipts = [...receipts];
        updatedReceipts[updatedReceiptIndex] = receiptToUpdate;
        this._receipts.next(updatedReceipts);
        this.updateCache().subscribe();
      })
    );
  }

  deleteReceipt(receiptId: string) {
    return this._receipts.pipe(
      take(1),
      tap((receipts: Receipt[]) => {
        this._receipts.next(
          receipts.filter((receipt) => receipt.timeStamp !== receiptId)
        );
        this.updateCache().subscribe();
      })
    );
  }

  verifyIfExists(item, list) {
    let verification = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i] === item) {
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
        return Filesystem.writeFile({
          data: "",
          path: "receipts/receipts.json",
          directory: FilesystemDirectory.Data,
          encoding: FilesystemEncoding.UTF8,
        }).then(() => {
          console.log("Creating 'receipts.json' in 'receipts/'");
          this.fetchReceipts();
        });
      }
    } catch (e) {
      console.log("Unable to read dir: " + e);
      return Filesystem.writeFile({
        data: "",
        path: "receipts/receipts.json",
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8,
      }).then(() => {
        console.log("Creating 'receipts.json'");
        this.fetchReceipts();
      });
    }
  }
}
