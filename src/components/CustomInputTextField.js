import React from 'react';

export default function CustomInputTextField({ component: Component, inputRef, ...other }) {

   // implement `InputElement` interface
   React.useImperativeHandle(inputRef, () => ({
      focus: () => {
         // logic to focus the rendered component from 3rd party belongs here
      },
      // hiding the value e.g. react-stripe-elements
   }));

   // `Component` will be your `SomeThirdPartyComponent` from below
   return <Component {...other} />;
}
