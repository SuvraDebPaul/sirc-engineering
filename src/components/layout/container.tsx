import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <section className={cn("w-11/12 mx-auto", className)}>{children}</section>
  );
};
