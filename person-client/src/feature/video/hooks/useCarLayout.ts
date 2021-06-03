import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { getCarVideoLayout } from "../car-video-layout-helper";
import { some } from 'lodash';

const PAGINATION_SIZE = 1;

interface IParticipant extends Participant {
  type: string;
  score: number;
}

const deduplicate = function<U extends T, T>(array: U[], equal: (a: T, b: T) => boolean): U[] {
  const deduplicated: U[] = [];

  array.forEach(element => {
    if (!some(deduplicated, d => equal(d, element))) {
      deduplicated.push(element);
    }
  });

  return deduplicated;
}


export function useCarLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  upperPagination: Pagination,
  lowerPagination: Pagination,
  specialPaginationNames: string[]
) {

  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const [visibleSpecialPaginationItems, setVisibleSpecialPaginationItems] = useState<boolean[]>([]);

  const upperSize = 1;
  const lowerSize = 1;

  useEffect(() => {
    setLayout(getCarVideoLayout(dimension.width, dimension.height, upperSize, lowerSize));
  }, [dimension, upperSize, lowerSize]);

  const { page, pageSize, userDisplayNamesForPagination } = upperPagination;
  const { page: page1, pageSize: pageSize1, userDisplayNamesForPagination: userDisplayNamesForPagination1} = lowerPagination;

  const onParticipantsChange = useCallback(() => {
    const participants = zmClient.getAllUser().map(p => ({...p, type: "participant", score: 0}));
    const currentUser = zmClient.getCurrentUserInfo();
    if (currentUser && participants.length > 0) {

      const allExpectedNames = userDisplayNamesForPagination.concat(userDisplayNamesForPagination1);
      const unknownParticipants = participants.filter(p => !allExpectedNames.includes(p.displayName));

      const getAllPaginationParticipants = (currentUser: Participant, participants: IParticipant[], pagination: {userDisplayNamesForPagination: string[]}, unknownParticipantsToAdd: IParticipant[] = []) => {
        let pageParticipants: IParticipant[];
        pageParticipants = participants.filter(p => pagination.userDisplayNamesForPagination.includes(p.displayName));
        pageParticipants.push(...unknownParticipantsToAdd);
        pageParticipants.forEach((participant: IParticipant, i) => {
          /*
           * Sort participants: have them in the same order as the given userDisplayNamesForPagination
           * but also show the ones with enabled viCdeo first
           * smaller score -> participant comes first
           */
          let score = pagination.userDisplayNamesForPagination.indexOf(participant.displayName);
          if (score < 0) {
            score = pageParticipants.length;
          }
          if (!participant.bVideoOn) {
            score += pageParticipants.length + 1;
          }
          participant.score = score;
        });
        pageParticipants = pageParticipants
          .sort((user1, user2) => user1.score - user2.score);
        return pageParticipants;
      }

      const getShownPageParticipants = (participants: any[], pagination: {page: number, pageSize: number}) =>
        participants.filter((_user, index) => Math.floor(index / pagination.pageSize) === pagination.page);

      const upperPageParticipants = getAllPaginationParticipants(currentUser, participants, {userDisplayNamesForPagination}, unknownParticipants);

      let lowerPageParticipants: Array<Participant|{type: string, displayName: string, bVideoOn: boolean}> = [

      ];
      const specialParticipants = specialPaginationNames.map((p, i) => ({type: "specialPaginationItem", displayName: p, index: i, bVideoOn: true}));
      if (specialParticipants.length === 2) {
        lowerPageParticipants.push(specialParticipants[0]);
        lowerPageParticipants = lowerPageParticipants.concat(
          getAllPaginationParticipants(currentUser, participants, {userDisplayNamesForPagination: userDisplayNamesForPagination1}));
        lowerPageParticipants.push(specialParticipants[1]);
      } else {
        lowerPageParticipants = lowerPageParticipants.concat(
          getAllPaginationParticipants(currentUser, participants, {userDisplayNamesForPagination: userDisplayNamesForPagination1}));
        lowerPageParticipants = lowerPageParticipants.concat(specialParticipants);
      }


      const upperShownParticipants = getShownPageParticipants(upperPageParticipants, {page: page, pageSize: pageSize});
      const lowerShownParticipants = getShownPageParticipants(lowerPageParticipants, {page: page1, pageSize: pageSize1});

      const lowerSpecialParticipants = lowerShownParticipants.filter(p => p.type === "specialPaginationItem");
      const visibleSpecialItems = specialPaginationNames.map(n => lowerSpecialParticipants.find(p => p.displayName === n) != null);
      setVisibleSpecialPaginationItems(visibleSpecialItems);

      const lowerShownVideoParticipants = lowerShownParticipants.filter(p => p.type === "participant");

      let allShownParticipants: Participant[] = upperShownParticipants.concat(lowerShownVideoParticipants);
      // allPageParticipants = deduplicate(allPageParticipants, (a: Participant, b: Participant) => a.userId == b.userId);

      setVisibleParticipants(allShownParticipants);
      const videoParticipants = allShownParticipants
        .filter((user) => user.bVideoOn)
        .map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  },[zmClient, page, pageSize, userDisplayNamesForPagination, page1, pageSize1, userDisplayNamesForPagination1, specialPaginationNames]);

  useEffect(() => {
    zmClient.on('user-added', onParticipantsChange);
    zmClient.on('user-removed', onParticipantsChange);
    zmClient.on('user-updated', onParticipantsChange);
    return () => {
      zmClient.off('user-added', onParticipantsChange);
      zmClient.off('user-removed', onParticipantsChange);
      zmClient.off('user-updated', onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange]);
  useEffect(() => {
    onParticipantsChange();
  }, [onParticipantsChange]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
  );
  return {
    visibleParticipants,
    layout,
    visibleSpecialPaginationItems,
  };
}
