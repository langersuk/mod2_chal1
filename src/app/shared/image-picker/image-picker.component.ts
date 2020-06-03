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
  @Output() imagePick = new EventEmitter<String | CameraPhoto>();
  @Input() showPreview = false;
  @Input() selectedImage: string;
  usePicker = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    if (
      (this.platform.is("mobile") && !this.platform.is("hybrid")) ||
      this.platform.is("desktop")
    ) {
      this.usePicker = true;
    }
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(dataUrl);
    };
    fr.readAsDataURL(pickedFile);
  }

  async takePicture() {
    if (!Capacitor.isPluginAvailable("Camera") || this.usePicker) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    const image = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Uri,
    });
    var imageUrl = image.webPath;
    this.selectedImage = imageUrl;
    this.imagePick.emit(image);
  }
}
