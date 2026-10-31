import React from 'react';

interface CloudGridSkeletonProps {
  folderCount?: number;
  fileCount?: number;
}

const FOLDER_NAME_WIDTHS = [110, 140, 95, 125, 105, 130];
const FILE_NAME_WIDTHS = [130, 160, 110, 145, 120, 155, 100, 135];

export const CloudGridSkeleton: React.FC<CloudGridSkeletonProps> = ({
  folderCount = 4,
  fileCount = 8,
}) => {
  const folders = Array.from({ length: folderCount });
  const files = Array.from({ length: fileCount });

  return (
    <div className="p-4 space-y-6 select-none">
      {/* Khối thư mục Skeleton */}
      {folderCount > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="cloud-skeleton-box"
              style={{ width: 85, height: 16, borderRadius: 4 }}
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5">
            {folders.map((_, idx) => {
              const nameWidth =
                FOLDER_NAME_WIDTHS[idx % FOLDER_NAME_WIDTHS.length];
              return (
                <div
                  key={idx}
                  className="h-[50px] px-3 rounded-[10px] border border-slate-200 bg-white flex items-center gap-2.5 pointer-events-none"
                  style={{ opacity: 0.9 }}
                >
                  {/* Folder Icon Skeleton */}
                  <div
                    className="cloud-skeleton-box flex-shrink-0"
                    style={{ width: 24, height: 24, borderRadius: 6 }}
                  />
                  {/* Folder Info */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div
                      className="cloud-skeleton-box"
                      style={{ width: nameWidth, height: 13, borderRadius: 3 }}
                    />
                    <div
                      className="cloud-skeleton-box"
                      style={{ width: 60, height: 10, borderRadius: 3 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Khối tệp tin Skeleton */}
      {fileCount > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="cloud-skeleton-box"
              style={{ width: 75, height: 16, borderRadius: 4 }}
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            {files.map((_, idx) => {
              const nameWidth = FILE_NAME_WIDTHS[idx % FILE_NAME_WIDTHS.length];
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden pointer-events-none"
                  style={{ opacity: 0.95 }}
                >
                  {/* Preview Thumbnail Box */}
                  <div className="h-[110px] bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                    <div
                      className="cloud-skeleton-box"
                      style={{ width: '80%', height: '65%', borderRadius: 6 }}
                    />
                  </div>

                  {/* File Metadata */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="cloud-skeleton-box flex-shrink-0"
                        style={{ width: 16, height: 16, borderRadius: 4 }}
                      />
                      <div
                        className="cloud-skeleton-box flex-1"
                        style={{
                          width: nameWidth,
                          height: 13,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div
                        className="cloud-skeleton-box"
                        style={{ width: 55, height: 10, borderRadius: 3 }}
                      />
                      <div
                        className="cloud-skeleton-box"
                        style={{ width: 40, height: 10, borderRadius: 3 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
