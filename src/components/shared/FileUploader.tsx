import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";
import { Button } from "../ui/button";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

// 10MB in bytes calculation constant
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      console.log('onDrop called with acceptedFiles:', acceptedFiles);
      
      // Clear any previous error
      setErrorMessage('');
      
      if (acceptedFiles && acceptedFiles.length > 0) {
        // If the file is valid, proceed safely
        console.log('File is valid, processing...');
        setFile(acceptedFiles);
        fieldChange(acceptedFiles);
        setFileUrl(convertFileToUrl(acceptedFiles[0]));
      }
    },
    [fieldChange] // Swapped 'file' with 'fieldChange' dependency to avoid unnecessary reinvocations
  );

  const onDropRejected = useCallback(
    (rejectedFiles: any[]) => {
      console.log('onDropRejected called with:', rejectedFiles);
      
      if (rejectedFiles && rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          console.log('Rejected file:', file);
          if (file.errors) {
            file.errors.forEach((error: any) => {
              console.log('File error:', error);
              if (error.code === 'file-too-large') {
                // Updated warning to reflect 10MB
                setErrorMessage('File size exceeds 10MB limit. Please choose a smaller file.');
              } else if (error.code === 'file-invalid-type') {
                setErrorMessage('Invalid file type. Please upload PNG, JPG, or HEIF image.');
              } else {
                setErrorMessage('File upload error. Please try again.');
              }
            });
          }
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".heif"],
    },
    maxSize: MAX_FILE_SIZE, // Updated dropzone options limit to 10MB
    multiple: false, 
  });

  console.log('FileUploader rendered, isDragActive:', isDragActive);

  return (
    <div>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
        <input {...getInputProps()} className="cursor-pointer" />

        {fileUrl ? (
          <>
            <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
              <img src={fileUrl} alt="image" className="file_uploader-img" />
            </div>
            <p className="file_uploader-label">Click or drag photo to replace</p>
          </>
        ) : (
          <div className="file_uploader-box ">
            <img
              src="/assets/icons/file-upload.svg"
              width={96}
              height={77}
              alt="file upload"
            />

            <h3 className="base-medium text-light-2 mb-2 mt-6">
              Drag photo here
            </h3>
            {/* Updated fallback text block below */}
            <p className="text-light-4 small-regular mb-6">PNG, JPG, HEIF (Max 10MB)</p>

            <Button type="button" className="shad-button_dark_4">
              Select from computer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;