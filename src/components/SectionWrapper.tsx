import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const SectionWrapper = ({ id, className, children }: Props) => (
  <motion.section
    id={id}
    className={cn("py-20 px-4 md:px-8", className)}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <div className="mx-auto max-w-6xl">{children}</div>
  </motion.section>
);

export default SectionWrapper;
