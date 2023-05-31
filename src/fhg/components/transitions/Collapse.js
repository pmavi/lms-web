import React from 'react';
import {useSpring, animated} from 'react-spring';

export default function Collapse(props) {
   let style = useSpring({
      from: {opacity: 0, transform: 'translateY(-340px)', marginLeft: 'auto', marginRight: 'auto'},
      to: {
         opacity: props.in ? 1 : 0,
         transform: `translateY(${props.in ? 0 : -340}px)`,
         marginLeft: 'auto',
         marginRight: 'auto',
      },
      overflow: 'hidden',
      position: 'relative',
   });
   return <animated.div style={style}>{props.children}</animated.div>;
}
