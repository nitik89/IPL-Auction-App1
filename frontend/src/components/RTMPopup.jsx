import React from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";

const RTMPopup = ({
  isOpened,
  onClose,
  handleYes,
  currentPlayer,
  handleNo,
}) => {
  return (
    <>
      <Modal isOpen={isOpened} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Do you want to retain {currentPlayer?.name} at{" "}
              {currentPlayer?.final_price / 10000000} CR ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleYes}>
              Yes
            </Button>
            <Button colorScheme="red" onClick={handleNo}>
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default RTMPopup;
