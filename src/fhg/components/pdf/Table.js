import * as React from "react";
import {View} from "@react-pdf/renderer";

export default function Table ({style={}, children, ...props}) {

      return (
         <View style={{...style, width: "100%"}} {...props}>
            {children}
         </View>
      );
}
