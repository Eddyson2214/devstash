import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "?";
}

export function UserAvatar({ name, email, image, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-6", className)}>
      {image && <AvatarImage src={image} alt={name ?? "User avatar"} />}
      <AvatarFallback>{getInitials(name, email)}</AvatarFallback>
    </Avatar>
  );
}
