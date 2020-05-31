import { Receipt } from "./receipt.model";
import { Injectable } from "@angular/core";
import { BehaviorSubject, pipe } from "rxjs";
import { take, switchMap, tap, delay } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class ReceiptService {
  private _receipts = new BehaviorSubject<Receipt[]>([
    new Receipt(
      "R1",
      1.99,
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg",
      new Date(2018, 11, 24)
    ),
    new Receipt(
      "R2",
      7.99,
      "https://live.staticflickr.com/2596/4139352235_bbfa7e37fb_b.jpg",
      new Date(2019, 1, 12)
    ),
    new Receipt(
      "R3",
      3.99,
      "https://live.staticflickr.com/3294/2623977987_8937dd3bc7_b.jpg",
      new Date(2017, 5, 19)
    ),
  ]);

  get receipts() {
    return this._receipts.asObservable();
  }

  total() {
    let total = 0;
    this.receipts.pipe(take(1)).subscribe((receipts) => {
      receipts.forEach((receipt: Receipt) => {
        total += +receipt.cost;
      });
    });
    return total;
  }

  deleteReceipt(receiptId: string) {
    return this._receipts.pipe(
      take(1),
      tap((receipts) => {
        this._receipts.next(
          receipts.filter((receipt) => receipt.id !== receiptId)
        );
      })
    );
  }
}
