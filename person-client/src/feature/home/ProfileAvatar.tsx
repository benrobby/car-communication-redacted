// @ts-ignore
import ReactRoundedImage from "react-rounded-image";
import "./profileAvatar.scss";
import useWindowDimensions from "../../hooks/useWindowDimension";


interface IProfileAvatarProps {
  picturePath: string;
  size: number;
  online: boolean;
  adjustSize: boolean;
  style?: { [key: string]: string };
  showVideo?: () => void;
}

const ProfileAvatar = (props: IProfileAvatarProps) => {
  const {picturePath, size, online, adjustSize, style, showVideo} = props;

  const {height} = useWindowDimensions();
  const adjustedSize = adjustSize ? Math.max(size * (height / 1500), 32) : size;

  const circleSize = adjustedSize * 0.3;
  const circleBorderSize = adjustedSize / 25;
  return (
    <a onClick={() => showVideo != null ? showVideo() : null} className={"profileAvatar"} style={{...style, cursor: showVideo ? "pointer" : "default", height: `${adjustedSize}px`, width: `${adjustedSize}px`}}>
      <ReactRoundedImage image={picturePath} roundedSize="0" imageWidth={adjustedSize} imageHeight={adjustedSize} />
      <div className='status-circle' style={{
        height: `${circleSize}px`,
        width: `${circleSize}px`,
        border: `${circleBorderSize}px solid white`,
        backgroundColor: online ? "rgb(27,181,58)" : "grey"}}/>
    </a>
  );
};

export default ProfileAvatar;
