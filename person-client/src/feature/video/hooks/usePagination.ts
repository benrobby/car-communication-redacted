import { useState, useCallback, useEffect } from 'react';
import { maxViewportVideoCounts } from '../video-layout-helper';
import { useMount } from '../../../hooks';
import { Dimension, Pagination } from '../video-types';
import { ZoomClient } from '../../../index-types';
import { every } from 'lodash';
const MAX_NUMBER_PER_PAGE = 1;

export interface IExtendedPagination extends Pagination {
  setPage: any;
}

// eslint-disable-next-line import/prefer-default-export
export function usePagination(
  zmClient: ZoomClient,
  dimension: Dimension,
  paginationIndex: number,
  userDisplayNamesForPagination: string[][] = [],
  captureUnknownUsers: boolean = false,
  additionalPageCount = 0,
  dirty = false): IExtendedPagination {
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(additionalPageCount);
  const [pageSize, setPageSize] = useState(MAX_NUMBER_PER_PAGE);
  useEffect(() => {
    const size = Math.min(
      MAX_NUMBER_PER_PAGE,
      maxViewportVideoCounts(dimension.width, dimension.height),
    );
    setPageSize(size);
  }, [dimension]);
  const updateSize = () => {
    const allUserDisplayNames = zmClient.getAllUser().map(u => u.displayName);
    let usersForPagination = allUserDisplayNames.filter(u => userDisplayNamesForPagination[paginationIndex].includes(u));
    const unknownUsers = allUserDisplayNames.filter(u => every(userDisplayNamesForPagination, names => !names.includes(u)));

    if (captureUnknownUsers) {
      usersForPagination = usersForPagination.concat(unknownUsers);
    }
    setTotalSize(usersForPagination.length + additionalPageCount);
  };
  const onParticipantsChange = useCallback(updateSize, [zmClient, dirty, additionalPageCount]);
  useEffect(() => {
    zmClient.on('user-added', onParticipantsChange);
    zmClient.on('user-removed', onParticipantsChange);
    zmClient.on('user-updated', onParticipantsChange);
    return () => {
      zmClient.off('user-added', onParticipantsChange);
      zmClient.off('user-removed', onParticipantsChange);
      zmClient.off('user-updated', onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange, dirty]);
  useMount(updateSize);
  if (dirty) {
    onParticipantsChange();
  }
  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage,
    userDisplayNamesForPagination: userDisplayNamesForPagination[paginationIndex],
  };
}
