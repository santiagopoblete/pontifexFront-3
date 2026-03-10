import { CloudUpload } from "lucide-react";

interface CloudUploadIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export function CloudUploadIcon({ size = 24, color = "currentColor", className, ...props }: CloudUploadIconProps) {
  return <CloudUpload size={size} color={color} className={className} {...props} />;
}
