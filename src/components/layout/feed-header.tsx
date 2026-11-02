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
    <div className="flex flex-col pt-5 pb-6 text-center lg:my-8 lg:gap-2 lg:rounded-[22px] lg:bg-brand lg:px-10 lg:py-9 lg:text-left">
      <Heading className="text-2xl font-normal tracking-[0.08em] uppercase lg:text-[40px] lg:leading-tight lg:font-semibold lg:tracking-[-0.02em] lg:normal-case">
        {title}
      </Heading>
      <p className="mt-1 text-micro tracking-[0.16em] text-secondary uppercase lg:order-first lg:mt-0 lg:text-sm lg:font-semibold lg:text-ink">
        {subtitle}
      </p>
      {description && (
        <p className="hidden max-w-2xl text-base text-ink-soft lg:block">
          {description}
        </p>
      )}
    </div>
  );
}
