import React from 'react';

interface CloudTableSkeletonProps {
  rowCount?: number;
  isTrashMode?: boolean;
}

const NAME_WIDTHS = [180, 240, 150, 210, 260, 170, 225, 195];

export const CloudTableSkeleton: React.FC<CloudTableSkeletonProps> = ({
  rowCount = 8,
  isTrashMode = false,
}) => {
  const rows = Array.from({ length: rowCount });

  return (
    <div className="cloud-table-wrapper select-none">
      <table className="cloud-table">
        <colgroup>
          <col style={{ width: 40 }} />
          <col />
          <col style={{ width: 150 }} />
          <col style={{ width: 170 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 68 }} />
        </colgroup>
        <thead>
          <tr>
            <th className="cloud-col-star"></th>
            <th className="cloud-col-name">
              <span>Tên</span>
            </th>
            <th className="cloud-col-updated">
              <span>{isTrashMode ? 'Ngày xóa' : 'Ngày sửa đổi'}</span>
            </th>
            <th className="cloud-col-owner">
              <span>Người sở hữu</span>
            </th>
            <th className="cloud-col-size">
              <span>Kích thước</span>
            </th>
            <th className="cloud-col-share">
              <span>{isTrashMode ? 'Vị trí ban đầu' : 'Chia sẻ'}</span>
            </th>
            <th className="cloud-col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, idx) => {
            const nameWidth = NAME_WIDTHS[idx % NAME_WIDTHS.length];
            return (
              <tr key={idx} className="cloud-table-skeleton-row">
                {/* Cột 1: Star */}
                <td className="cloud-col-star">
                  <div
                    className="cloud-skeleton-box"
                    style={{ width: 14, height: 14, borderRadius: 3 }}
                  />
                </td>

                {/* Cột 2: Icon + Tên */}
                <td className="cloud-col-name">
                  <div className="cloud-table-skeleton-file">
                    <div className="cloud-skeleton-box cloud-table-skeleton-icon" />
                    <div
                      className="cloud-skeleton-box cloud-table-skeleton-name"
                      style={{ width: nameWidth }}
                    />
                  </div>
                </td>

                {/* Cột 3: Ngày sửa đổi */}
                <td>
                  <div
                    className="cloud-skeleton-box"
                    style={{ width: 95, height: 13 }}
                  />
                </td>

                {/* Cột 4: Người sở hữu */}
                <td>
                  <div className="cloud-table-skeleton-owner">
                    <div className="cloud-skeleton-box cloud-table-skeleton-avatar" />
                    <div
                      className="cloud-skeleton-box"
                      style={{ width: 75, height: 13 }}
                    />
                  </div>
                </td>

                {/* Cột 5: Kích thước */}
                <td>
                  <div
                    className="cloud-skeleton-box"
                    style={{ width: 48, height: 13 }}
                  />
                </td>

                {/* Cột 6: Chia sẻ */}
                <td>
                  <div
                    className="cloud-skeleton-box"
                    style={{ width: 80, height: 18, borderRadius: 12 }}
                  />
                </td>

                {/* Cột 7: Actions */}
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <div
                      className="cloud-skeleton-box"
                      style={{ width: 18, height: 18, borderRadius: 4 }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
