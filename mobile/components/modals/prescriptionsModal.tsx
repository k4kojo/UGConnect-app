import React from "react";
import { Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  prescription: any | null;
};

const PrescriptionModal: React.FC<Props> = ({ onClose, prescription }) => (
  <View>
    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Prescription</Text>
    {prescription?.title ? (
      <Text>{prescription.title}</Text>
    ) : (
      <Text>Prescription file ready for download.</Text>
    )}
  </View>
);

export default PrescriptionModal;
