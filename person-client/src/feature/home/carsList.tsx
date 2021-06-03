import { FirebaseDatabaseNode } from "@react-firebase/database";
import React from "react";
import CarListItem from "./carListItem";
import "./carsList.scss";
import { List, makeStyles } from "@material-ui/core";
import useWindowDimensions from "../../hooks/useWindowDimension";

interface ICar {
  name: string;
  target_description: string;
  current_coord: string;
  current_target_coord: string;
  driving: boolean;
  speed: number;
  current_passengers: string[];
}

interface ICars {
  [key: string]: ICar;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: undefined,
  },
}));

interface ICarsListProps {
  onVideoClick: (type: string, additionalUrlParam: string) => void;
  unfoldVideo: () => void;
}

const CarsList = (props: ICarsListProps) => {
  const {onVideoClick, unfoldVideo} = props;
  const classes = useStyles();

  return (
    <div className={"carsList"} style={{marginTop: `${8 * useWindowDimensions().height / 1500}%`}}>
      <h2>My Cars</h2>
      <FirebaseDatabaseNode
        path={`cars`}
        limitToFirst={10}>
        {
          (result) => {
            if (result.value == null) {
              return null;
            }
            const value: ICars = result.value;
            const cars = Object.entries(value);

            return (
              <List className={classes.root}>
                {cars
                .map(([key, {name, driving, target_description, current_passengers}], index) => (
                  <CarListItem unfoldVideo={unfoldVideo} onVideoClick={onVideoClick} key={key} id={key} name={name} driving={driving} targetDescription={target_description} currentPassengers={current_passengers} />
                ))}
              </List>
            )
          }
        }
      </FirebaseDatabaseNode>
    </div>
  );
}

export default CarsList;
