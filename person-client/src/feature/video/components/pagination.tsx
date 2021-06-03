/* eslint-disable react/jsx-boolean-value */
import React, { useCallback, useEffect } from 'react';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classnames from 'classnames';
import './pagination.scss';
interface PaginationProps {
  page: number;
  totalPage: number;
  setPage: (page: number) => void;
  inSharing?: boolean;
  isTop?: boolean;
  switchToNextPageAfterTimeout?: boolean;
}
const Pagination = (props: PaginationProps) => {
  const { page, totalPage, setPage, inSharing, isTop, switchToNextPageAfterTimeout } = props;
  const pageIndication = `${page + 1}/${totalPage}`;
  const toPreviousPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page, setPage]);
  const toNextPage = useCallback(() => {
    if (page < totalPage - 1) {
      setPage(page + 1);
    }
  }, [page, totalPage, setPage]);

  useEffect(() => {
    if (switchToNextPageAfterTimeout) {
      setTimeout(() => toNextPage(), 1000);
    }
  }, []);
  return (
    <div
      className={classnames('pagination', { 'in-sharing': inSharing })}
      style={{top: isTop === undefined ? '50%' : isTop ? '25%' : '75%'}}
    >
      <Button
        key="left"
        className="previous-page-button"
        icon={<CaretLeftOutlined />}
        ghost={true}
        onClick={toPreviousPage}
      >
        {pageIndication}
      </Button>
      <Button
        key="right"
        className="next-page-button"
        icon={<CaretRightOutlined />}
        ghost={true}
        onClick={toNextPage}
      >
        {pageIndication}
      </Button>
    </div>
  );
};

export default Pagination;
