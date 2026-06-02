import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

const upload = async (file) => {
  const storage = getStorage();
  const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      null,
      (error) => reject("Upload failed: " + error.code),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(resolve);
      }
    );
  });
};

export default upload;
