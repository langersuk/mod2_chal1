import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  Input,
  EventEmitter,
} from "@angular/core";
import { Platform } from "@ionic/angular";
import {
  Plugins,
  Capacitor,
  CameraSource,
  CameraResultType,
  CameraPhoto,
} from "@capacitor/core";

const { Camera } = Plugins;

@Component({
  selector: "app-image-picker",
  templateUrl: "./image-picker.component.html",
  styleUrls: ["./image-picker.component.scss"],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild("filePicker") filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<CameraPhoto>();
  @Input() showPreview = false;
  selectedImage: string;
  // usePicker = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    //   console.log("Mobile:", this.platform.is("mobile"));
    //   console.log("Hybrid:", this.platform.is("hybrid"));
    //   console.log("iOS:", this.platform.is("ios"));
    //   console.log("Android:", this.platform.is("android"));
    //   console.log("Desktop:", this.platform.is("desktop"));
    //   if (
    //     (this.platform.is("mobile") && !this.platform.is("hybrid")) ||
    //     this.platform.is("desktop")
    //   ) {
    //     this.usePicker = true;
    //   }
  }
  // onPickImage() {
  //   if (!Capacitor.isPluginAvailable("Camera") || this.usePicker) {
  //     this.filePickerRef.nativeElement.click();
  //     return;
  //   }
  //   Plugins.Camera.getPhoto({
  //     quality: 50,
  //     source: CameraSource.Prompt,
  //     correctOrientation: true,
  //     width: 600,
  //     resultType: CameraResultType.DataUrl,
  //   })
  //     .then((image) => {
  //       this.selectedImage = image.dataUrl;
  //       this.imagePick.emit(image.dataUrl);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       if (this.usePicker) {
  //         this.filePickerRef.nativeElement.click();
  //       }
  //       return false;
  //     });
  // }

  // onFileChosen(event: Event) {
  //   const pickedFile = (event.target as HTMLInputElement).files[0];
  //   if (!pickedFile) {
  //     return;
  //   }
  //   const fr = new FileReader();
  //   fr.onload = () => {
  //     const dataUrl = fr.result.toString();
  //     this.selectedImage = dataUrl;
  //     this.imagePick.emit(pickedFile);
  //   };
  //   fr.readAsDataURL(pickedFile);
  // }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Uri,
      // source: CameraSource.Camera,
    });
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;
    // Can be set to the src of an image now
    this.selectedImage = imageUrl;
    this.imagePick.emit(image);
    console.log(image.webPath);
    console.log(image.path);
  }
}
