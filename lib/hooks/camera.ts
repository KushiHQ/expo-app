import { Href, usePathname, useRouter } from "expo-router";
import { useGalleryStore } from "../stores/gallery";
import { cast } from "../types/utils";

type CameraRedirectOptions = {
  clear?: boolean;
  multiple?: boolean;
  images?: string[];
};

type GalleryRedirectOptions = {
  push?: boolean;
  activeIndex?: number;
  redirect: Href;
  images?: string[];
  viewOnly?: boolean;
  fromCamera?: boolean;
};

export const useCameraScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setGallery, clearGallery } = useGalleryStore();

  const redirect = (opts?: CameraRedirectOptions) => {
    let path = `/camera?redirect=${pathname}`;
    if (opts?.clear) {
      clearGallery();
    }
    if (opts?.images?.length) {
      setGallery(opts.images);
      path = `${path}${opts.images.map((img) => "&images=" + img)}`;
    }
    if (opts?.multiple !== undefined) {
      path = `${path}&multiple=${opts.multiple}`;
    }
    router.push(cast(path));
  };

  return { redirect };
};

export const usePhotoGalleryScreen = () => {
  const router = useRouter();
  const { setGallery, setActiveIndex } = useGalleryStore();

  const redirect = (opts: GalleryRedirectOptions) => {
    let path = `/photo-gallery?redirect=${opts.redirect}`;
    if (opts.activeIndex !== undefined) {
      setActiveIndex(opts.activeIndex);
    }
    if (opts.images) {
      setGallery(opts.images);
    }
    if (opts.fromCamera !== undefined) {
      path = `${path}&fromCamera=${opts.fromCamera}`;
    }
    if (opts.viewOnly !== undefined) {
      path = `${path}&viewOnly=${opts.viewOnly}`;
    }

    if (opts.push) {
      router.push(cast(path));
    } else {
      router.replace(cast(path));
    }
  };

  return { redirect };
};
