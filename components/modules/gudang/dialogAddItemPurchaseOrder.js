import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import * as Yup from "yup";
import { stringSchema } from "utils/yupSchema";
import { useFormik } from "formik";
import SelectAsync from "components/SelectAsync";
import { getItem } from "api/gudang/item";
import { getSediaan } from "api/gudang/sediaan";
import { FocusError } from "focus-formik-error";
import { LoadingButton } from "@mui/lab";

const DialogAddItem = ({
  isOpen,
  isEditType = false,
  prePopulatedDataForm = {},
  createData = () => {},
  handleClose = () => {},
}) => {
  const addItemInitialValues = !isEditType
    ? {
        item: { id: "", kode: "", name: "", sediaan: { id: "", name: "" } },
        jumlah: null,
        sediaan: { id: "", name: "" },
      }
    : prePopulatedDataForm;

  const createAddItemSchema = Yup.object({
    item: Yup.object({
      id: stringSchema("Kode Item", true),
    }),
    sediaan: Yup.object({
      id: stringSchema("Satuan", true),
    }),
    jumlah: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Jumlah wajib diisi"),
  });

  const createAddItemValidation = useFormik({
    initialValues: addItemInitialValues,
    validationSchema: createAddItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let data = { ...values };
      try {
        createData(data);
        resetForm();
        handleClose();
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
      }
    },
  });

  return (
    <>
      <Dialog open={isOpen} onClose={() => handleClose()}>
        <DialogTitle sx={{ paddingLeft: 2, paddingBottom: 1 }}>
          Tambah Item
        </DialogTitle>
        <Divider sx={{ borderWidth: "1px" }} />
        <DialogContent sx={{ paddingBottom: 2 }}>
          <form onSubmit={createAddItemValidation.handleSubmit}>
            <FocusError formik={createAddItemValidation} />
            <div className="mt-40">
              <Grid container spacing={1}>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Nama Item</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <div className="mb-16">
                      <SelectAsync
                        id="item"
                        labelField="Nama Item"
                        labelOptionRef="name"
                        valueOptionRef="id"
                        handlerRef={createAddItemValidation}
                        handlerFetchData={getItem}
                        handlerOnChange={(value) => {
                          if (value) {
                            createAddItemValidation.setFieldValue(
                              "item",
                              value
                            );
                          } else {
                            createAddItemValidation.setFieldValue("item", {
                              id: "",
                              name: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Kode Item</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="item_kode"
                        name="item_kode"
                        label="Kode Item"
                        value={createAddItemValidation.values.item.kode}
                        disabled
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Jumlah</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="jumlah"
                        name="jumlah"
                        label="Jumlah"
                        value={createAddItemValidation.values.jumlah}
                        onChange={createAddItemValidation.handleChange}
                        error={
                          createAddItemValidation.touched.jumlah &&
                          Boolean(createAddItemValidation.errors.jumlah)
                        }
                        helperText={
                          createAddItemValidation.touched.jumlah &&
                          createAddItemValidation.errors.jumlah
                        }
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Satuan</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <div className="mb-16">
                      <SelectAsync
                        id="sediaan"
                        labelField="Satuan"
                        labelOptionRef="name"
                        valueOptionRef="id"
                        handlerRef={createAddItemValidation}
                        handlerFetchData={getSediaan}
                        handlerOnChange={(value) => {
                          if (value) {
                            createAddItemValidation.setFieldValue(
                              "sediaan",
                              value
                            );
                          } else {
                            createAddItemValidation.setFieldValue("sediaan", {
                              id: "",
                              name: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => handleClose(false)}
                  variant="contained"
                  color="error"
                  sx={{ marginRight: 1 }}
                >
                  Batal
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={createAddItemValidation.isSubmitting}
                >
                  {isEditType ? "Edit Item" : "Tambah Item"}
                </LoadingButton>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogAddItem;
