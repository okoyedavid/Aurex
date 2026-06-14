"use client";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

const ScrollAnimations = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress);
  const background = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(86, 1, 245)", "rgb(1, 245, 13"],
  );
  return (
    <div>
      <motion.div
        style={{
          //   scaleX: scrollYProgress,
          scaleX: scaleX,
          transformOrigin: "left",
          backgroundColor: background,
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "20px",
        }}
      ></motion.div>
      <div className="max-w-175 space-y-10">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          delectus minima velit ipsa, cum nesciunt, voluptatem sed numquam
          doloremque suscipit quae, magni rem quaerat. Soluta maiores officia et
          esse ab! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Asperiores delectus minima velit ipsa, cum nesciunt, voluptatem sed
          numquam doloremque suscipit quae, magni rem quaerat. Soluta maiores
          officia et esse ab! Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Asperiores delectus minima velit ipsa, cum nesciunt,
          voluptatem sed numquam doloremque suscipit quae, magni rem quaerat.
          Soluta maiores officia et esse ab!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          delectus minima velit ipsa, cum nesciunt, voluptatem sed numquam
          doloremque suscipit quae, magni rem quaerat. Soluta maiores officia et
          esse ab! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Asperiores delectus minima velit ipsa, cum nesciunt, voluptatem sed
          numquam doloremque suscipit quae, magni rem quaerat. Soluta maiores
          officia et esse ab! Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Asperiores delectus minima velit ipsa, cum nesciunt,
          voluptatem sed numquam doloremque suscipit quae, magni rem quaerat.
          Soluta maiores officia et esse ab!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          delectus minima velit ipsa, cum nesciunt, voluptatem sed numquam
          doloremque suscipit quae, magni rem quaerat. Soluta maiores officia et
          esse ab! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Asperiores delectus minima velit ipsa, cum nesciunt, voluptatem sed
          numquam doloremque suscipit quae, magni rem quaerat. Soluta maiores
          officia et esse ab! Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Asperiores delectus minima velit ipsa, cum nesciunt,
          voluptatem sed numquam doloremque suscipit quae, magni rem quaerat.
          Soluta maiores officia et esse ab!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          delectus minima velit ipsa, cum nesciunt, voluptatem sed numquam
          doloremque suscipit quae, magni rem quaerat. Soluta maiores officia et
          esse ab! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Asperiores delectus minima velit ipsa, cum nesciunt, voluptatem sed
          numquam doloremque suscipit quae, magni rem quaerat. Soluta maiores
          officia et esse ab! Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Asperiores delectus minima velit ipsa, cum nesciunt,
          voluptatem sed numquam doloremque suscipit quae, magni rem quaerat.
          Soluta maiores officia et esse ab!
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
          delectus minima velit ipsa, cum nesciunt, voluptatem sed numquam
          doloremque suscipit quae, magni rem quaerat. Soluta maiores officia et
          esse ab! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Asperiores delectus minima velit ipsa, cum nesciunt, voluptatem sed
          numquam doloremque suscipit quae, magni rem quaerat. Soluta maiores
          officia et esse ab! Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Asperiores delectus minima velit ipsa, cum nesciunt,
          voluptatem sed numquam doloremque suscipit quae, magni rem quaerat.
          Soluta maiores officia et esse ab!
        </p>
      </div>
    </div>
  );
};

export default ScrollAnimations;
