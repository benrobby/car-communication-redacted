import { CellLayout, Position } from "./video-types";

interface OverlappingTarget {
  topLeft: Position;
  bottomRight: Position;
}
interface Grid {
  row: number;
  column: number;
}
interface Layout {
  cellWidth: number;
  cellHeight: number;
  cellArea: number;
  column: number;
  row: number;
}

const aspectRatio = 16 / 9;
const minCellWidth = 256;
const minCellHeight = minCellWidth / aspectRatio;
const cellOffset = 5;
const maxCount = 2;
const VideoQuality = {
  Video_90P: 0,
  Video_180P: 1,
  Video_360P: 2,
  Video_720P: 3,
};
const layoutOfCount: Grid[] = [
  {
    row: 2,
    column: 1,
  }
];

const getPreferredLayout = (layoutOfCount: Grid[], rootWidth: number, rootHeight: number) => {
  return layoutOfCount
    .map((item) => {
      const { column, row } = item;
      const canonical = Math.floor(
        Math.min(rootWidth / (16 * column), rootHeight / (9 * row)),
      );
      const cellWidth = canonical * 16 - cellOffset * 2;
      const cellHeight = canonical * 9 - cellOffset * 2;
      return {
        cellWidth,
        cellHeight,
        cellArea: cellWidth * cellHeight,
        column,
        row,
      };
    })
    .reduce(
      (prev, curr) => {
        if (curr.cellArea > prev.cellArea) {
          return curr;
        }
        return prev;
      },
      { cellArea: 0, cellHeight: 0, cellWidth: 0, column: 0, row: 0 },
    );
}

export function getCarVideoLayout(
  rootWidth: number,
  rootHeight: number,
  upperCount: number,
  lowerCount: number,
): CellLayout[] {
  const totalCount = upperCount + lowerCount;
  if (totalCount > maxCount || totalCount === 0) {
    return [];
  }


  const preferredLayout = getPreferredLayout(layoutOfCount, rootWidth, rootHeight);
  const { cellWidth, cellHeight, column, row } = preferredLayout;
  const cellBoxWidth = cellWidth + cellOffset * 2;
  const cellBoxHeight = cellHeight + cellOffset * 2;
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset;
  const lastRowColumns = column - ((column * row) % totalCount);
  const lastRowMargin = (rootWidth - cellBoxWidth * lastRowColumns) / 2 + cellOffset;
  const cellDimensions: CellLayout[] = [];
  let quality = VideoQuality.Video_90P;
  if (totalCount <= 4 && cellHeight >= 270) {
    quality = VideoQuality.Video_360P;
  } else if (totalCount > 4 && cellHeight >= 180) {
    quality = VideoQuality.Video_180P;
  }

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const leftMargin = i !== row - 1 ? horizontalMargin : lastRowMargin;
      if (i * column + j < totalCount) {
        cellDimensions.push({
          width: cellWidth,
          height: cellHeight,
          x: Math.floor(leftMargin + j * cellBoxWidth),
          y: Math.floor(verticalMargin + (row - i - 1) * cellBoxHeight),
          quality,
        });
      }
    }
  }

  return cellDimensions;
}
