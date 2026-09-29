import { supabase } from "../config/supabase-storage.config.js";

const BUCKET = "Voting-assets";

export const uploadFile = async (folder, file) => {
  try {
    const extension = file.originalname.split(".").pop();
    const fileName = `${folder}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;
    return fileName;
  } catch (error) {
    throw new Error(`Storage upload failed:  ${error}`);
  }
};

export const deleteFile = async (path) => {
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Storage delete failed: ${error}`);
  }
};

export const getSignedUrl = async (path, expiredIn = 60) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiredIn);

    if (error || !data?.signedUrl) throw error;

    return data.signedUrl;
  } catch (error) {
    throw new Error(`Storage signed URL failed: ${error}`);
  }
};

export const getPublicUrl = (path, transformOptions = null) => {
  if (!path) return null;
  try {
    const options = transformOptions ? { transform: transformOptions } : {};
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path, options);
    return data.publicUrl;
  } catch (error) {
    throw new Error(`Storage public URL failed: ${error.message}`);
  }
};
