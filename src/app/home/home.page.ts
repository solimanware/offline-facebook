import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Add the new import
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
export interface IPost {
  id: number;
  timestamp: number;
  title?: string;
  content: string;
  img?: string;
}
const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  posts: IPost[] = [];
  images: LocalFile[] = [];
  trigger = 0;

  constructor(
    private storage: StorageService,
    private plt: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit() {
    this.storage.getObject('posts').then((posts: any) => {
      this.posts = posts || [];
      console.log(this.posts);
    });
    setInterval(() => (this.trigger = Math.random()), 60 * 1000);
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // Camera, Photos or Prompt!
    });

    if (image) {
      const base64Data = await this.readAsBase64(image);
      this.addNewPost(null, base64Data);
    }
  }

  // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
  async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  // Helper function
  convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  addNewPost(content?, img?) {
    // eslint-disable-next-line @typescript-eslint/quotes
    content = content || window.prompt("What's on your mind?");
    if (!content) return;
    this.storage.getObject('posts').then((posts: any) => {
      this.posts = posts || [];
      this.posts.unshift({
        id: +new Date(),
        timestamp: +new Date(),
        content,
        img,
      });
      this.storage.setObject('posts', this.posts);
    });
  }

  sharePost(content) {
    //share post to twitter
    window.location.href = `https://twitter.com/intent/tweet?text=${content}`;
  }

  addNewPicture() {}
}
