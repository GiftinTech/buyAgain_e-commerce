import { useState } from 'react';

const FileUpload: React.FC = () => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-400 bg-pink-50 transition hover:bg-pink-100"
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
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {fileName && (
        <p className="mt-2 text-sm text-gray-600">
          Selected file: <span className="font-semibold">{fileName}</span>
        </p>
      )}
    </div>
  );
};

export default FileUpload;
