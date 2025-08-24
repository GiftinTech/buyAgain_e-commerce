import { useState, useEffect } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  initialPhotoUrl?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  initialPhotoUrl,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Use useEffect to set the initial photo URL when the component mounts or the prop changes
  useEffect(() => {
    if (initialPhotoUrl) {
      setPreviewUrl(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      onFileChange(droppedFile);
    }
  };

  const handleRemove = () => {
    setFileName('');
    setPreviewUrl(null); // Clear the preview
    onFileChange(null);
  };

  const handleTriggerFileInput = () => {
    const fileInput = document.getElementById(
      'file-upload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // The imageUrl is used in the img src below
  const imageUrl = previewUrl || initialPhotoUrl;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border border-gray-300">
          {/* Use the imageUrl variable here */}
          <img
            src={imageUrl || ''}
            alt="Profile Preview"
            className="h-full w-full object-cover"
          />
        </div>

        <label
          htmlFor="file-upload"
          className={`relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
            isDragging
              ? 'border-pink-600 bg-pink-100'
              : 'border-pink-400 bg-pink-50 hover:bg-pink-100'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 h-10 w-10 text-pink-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 010 10H7z"
            />
          </svg>
          <span className="text-sm font-medium text-pink-600">
            Click to upload or drag & drop
          </span>
        </label>

        <div className="mt-4 flex flex-col items-center gap-4">
          {/* Use the fileName variable for conditional rendering */}
          {fileName && (
            <p className="text-sm text-gray-600">
              Selected file: <span className="font-semibold">{fileName}</span>
            </p>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              className="rounded-lg bg-pink-500 px-4 py-2 text-white"
              onClick={handleTriggerFileInput}
            >
              Change Photo
            </button>
            {/* Use initialPhotoUrl for conditional rendering of "Remove" button */}
            {initialPhotoUrl && (
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
                onClick={handleRemove}
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;
