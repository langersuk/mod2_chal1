import { Component, OnInit } from "@angular/core";
import { ReceiptService } from "../receipt.service";
import { Receipt } from "../receipt.model";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";
import { Filesystem, FilesystemDirectory } from "@capacitor/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  loadedReceipts: Receipt[];
  total: number;
  image = null;

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.receiptService.readdir()
    this.receiptService.receipts.subscribe((receipts) => {
      this.loadedReceipts = receipts;
    });
  }

  ionViewWillEnter() {
    this.total = this.receiptService.total();
  }

  onDelete(receipt: Receipt, slidingItem: IonItemSliding) {
    let receiptId = receipt.timeStamp.toString();
    this.loadingCtrl.create({ message: "Cancelling..." }).then((loadingEl) => {
      loadingEl.present();
      this.receiptService.deleteReceipt(receiptId).subscribe(() => {
        this.loadingCtrl.dismiss();
      });
    });
    slidingItem.close();
  }
  onEdit(receipt: Receipt, slidingItem: IonItemSliding) {
    let receiptId = receipt.timeStamp.toString();
    this.router.navigate(["./", "tabs", "home", "edit", receiptId]);
    slidingItem.close();
  }
  onDetail(receipt: Receipt) {
    let receiptId = receipt.timeStamp.toString();
    this.router.navigate(["./", "tabs", "home", receiptId]);
  }

  onTest() {
    return this.receiptService.receipts.subscribe((result: Receipt[]) => {
      // return Filesystem.readFile({
      //   path: result[3].imageUri,
      //   directory: FilesystemDirectory.Data,
      // }).then(()=> {
      this.image = result[3].imageUri;
    });

    // return Filesystem.readdir({
    //   path: "/receipts",
    //   directory: FilesystemDirectory.Documents,
    // }).then((files) => {
    //   console.log(files.files);
    // });
  }
}
