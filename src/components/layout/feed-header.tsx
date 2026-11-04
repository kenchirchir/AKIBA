type FeedHeaderProps = {
  title: string;
  subtitle: string;
  description?: string;
  as?: "h1" | "h2";
};

export function FeedHeader({
  title,
  subtitle,
  description,
  as: Heading = "h1",
}: FeedHeaderProps) {
  return (
    <div className="flex flex-col items-center pt-5 pb-6 text-center lg:pt-12 lg:pb-10">
      <Heading className="text-2xl font-normal tracking-[0.08em] uppercase lg:text-[34px] lg:leading-tight lg:tracking-[0.1em]">
        {title}
      </Heading>
      <p className="mt-1 text-micro tracking-[0.16em] text-secondary uppercase lg:mt-2 lg:text-xs">
        {subtitle}
      </p>
      {description && (
        <p className="mt-4 hidden max-w-2xl text-sm text-balance text-secondary lg:block">
          {description}
        </p>
      )}
    </div>
  );
}
