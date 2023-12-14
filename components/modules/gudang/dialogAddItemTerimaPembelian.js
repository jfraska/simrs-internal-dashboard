import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Typography,
  Snackbar,
  Divider,
  FormControl,
} from "@mui/material";
import * as Yup from "yup";
import { stringSchema } from "utils/yupSchema";
import { parse } from "date-fns";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { formatGenToIso, formatIsoToGen } from "utils/formatTime";
import { useFormik } from "formik";
import SelectAsync from "components/SelectAsync";
import { FocusError } from "focus-formik-error";
import { LoadingButton } from "@mui/lab";
import { getItem } from "api/gudang/item";

const DialogAddItem = ({
  isOpen,
  isEditType = false,
  prePopulatedDataForm = {},
  createData = () => {},
  updatePrePopulatedData = () => "update data",
  handleClose = () => {},
}) => {
  const tableItemInitialValues = !isEditType
    ? {
        nomor_batch: "",
        item: { id: "", kode: "", name: "", sediaan: { id: "", name: "" } },
        stok: "",
        harga_beli_satuan: "",
        harga_jual_satuan: "",
        diskon: "",
        margin: "",
        total_pembelian: "",
        tanggal_ed: null,
      }
    : prePopulatedDataForm;

  const createTableItemSchema = Yup.object({
    item: Yup.object({
      id: stringSchema("Kode Item", true),
    }),
    nomor_batch: Yup.string().required("Nomor batch wajib diisi"),
    stok: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Jumlah wajib diisi"),
    harga_beli_satuan: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Harga beli wajib diisi"),
    harga_jual_satuan: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Harga Jual wajib diisi"),
    diskon: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Diskon wajib diisi"),
    margin: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Margin wajib diisi"),
    total_pembelian: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Total pembelian wajib diisi"),
    tanggal_ed: Yup.date()
      .transform(function (value, originalValue) {
        if (this.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd/MM/yyyy", new Date());
        return result;
      })
      .typeError("Expired Date tidak valid")
      .min("2023-01-01", "Expired Date tidak valid")
      .required("Expired Date wajib diisi"),
  });

  const createTableItemValidation = useFormik({
    initialValues: tableItemInitialValues,
    // validationSchema: createTableItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let data = { ...values };
      try {
        if (!isEditType) {
          data = {
            ...data,
            tanggal_ed: formatIsoToGen(data.tanggal_ed),
          };
          createData(data);
          resetForm();
          handleClose();
        } else {
          data = {
            ...data,
            tanggal_ed: formatIsoToGen(data.tanggal_ed),
          };
          updatePrePopulatedData(data);
          resetForm();
          handleClose();
        }
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
      }
    },
  });

  // useEffect(() => {
  //   if (!isEditType) {
  //     const margin = "";
  //     const harga_jual_satuan = "";
  //     const total_pembelian = "";
  //     if (
  //       createTableItemValidation.values.stok != "" &&
  //       createTableItemValidation.values.harga_beli_satuan != "" &&
  //       createTableItemValidation.values.diskon != ""
  //     ) {
  //       const stok = parseInt(createTableItemValidation.values.stok);
  //       const harga_beli_satuan = parseInt(
  //         createTableItemValidation.values.harga_beli_satuan
  //       );
  //       const diskon = parseInt(createTableItemValidation.values.diskon);

  //       const total = stok * harga_beli_satuan;
  //       console.log(`Total: ${total}`);

  //       const afterDiskon = total * (diskon / 100);
  //       console.log(`Diskon: ${afterDiskon}`);

  //       const ppn = total * (11 / 100);
  //       console.log(`PPN: ${ppn}`);

  //       total_pembelian = total - afterDiskon + ppn;
  //       console.log(`Total Pembelian: ${total_pembelian}`);

  //       margin = total_pembelian * (20 / 100);
  //       console.log(`Margin: ${margin}`);

  //       harga_jual_satuan = margin / stok + harga_beli_satuan;
  //       console.log(`Harga Jual Satuan: ${harga_jual_satuan}`);

  //       total_pembelian = total_pembelian.toFixed(2);
  //       console.log(`Total Pembelian Fixed: ${total_pembelian}`);
  //     }
  //     createTableItemValidation.setFieldValue("margin", parseInt(margin));
  //     createTableItemValidation.setFieldValue(
  //       "harga_jual_satuan",
  //       parseInt(harga_jual_satuan)
  //     );
  //     createTableItemValidation.setFieldValue(
  //       "total_pembelian",
  //       parseInt(total_pembelian)
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   createTableItemValidation.values.stok,
  //   createTableItemValidation.values.harga_beli_satuan,
  //   createTableItemValidation.values.diskon,
  // ]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => handleClose()}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ paddingLeft: 2, paddingBottom: 1 }}>
          {!isEditType ? "Tambah Item" : "Update Item"}
        </DialogTitle>
        <Divider sx={{ borderWidth: "1px" }} />
        <DialogContent sx={{ paddingBottom: 2 }}>
          <form onSubmit={createTableItemValidation.handleSubmit}>
            <FocusError formik={createTableItemValidation} />
            <div className="mt-40">
              <Grid container spacing={0}>
                <Grid item xs={9} md={6} lg={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Nama Item</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <SelectAsync
                          id="item"
                          labelField="Nama Item"
                          labelOptionRef="name"
                          valueOptionRef="id"
                          handlerRef={createTableItemValidation}
                          handlerFetchData={getItem}
                          handlerOnChange={(value) => {
                            if (value) {
                              createTableItemValidation.setFieldValue(
                                "item",
                                value
                              );
                            } else {
                              createTableItemValidation.setFieldValue("item", {
                                id: "",
                                name: "",
                              });
                            }
                          }}
                          isDisabled={isEditType}
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Kode Item</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="kode_item"
                          name="kode_item"
                          label="Kode Item"
                          value={createTableItemValidation.values.item.kode}
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.item &&
                            Boolean(createTableItemValidation.errors.item)
                          }
                          helperText={
                            createTableItemValidation.touched.item &&
                            createTableItemValidation.errors.item
                          }
                          disabled
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">
                        Nomor Batch
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="nomor_batch"
                          name="nomor_batch"
                          label="Nomor Batch"
                          value={createTableItemValidation.values.nomor_batch}
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.nomor_batch &&
                            Boolean(
                              createTableItemValidation.errors.nomor_batch
                            )
                          }
                          helperText={
                            createTableItemValidation.touched.nomor_batch &&
                            createTableItemValidation.errors.nomor_batch
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Jumlah</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="stok"
                          name="stok"
                          label="Jumlah"
                          value={createTableItemValidation.values.stok}
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.stok &&
                            Boolean(createTableItemValidation.errors.stok)
                          }
                          helperText={
                            createTableItemValidation.touched.stok &&
                            createTableItemValidation.errors.stok
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Sediaan</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="sediaan_item"
                          name="sediaan_item"
                          label="Sediaan"
                          value={
                            createTableItemValidation.values.item.sediaan.name
                          }
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.item &&
                            Boolean(createTableItemValidation.errors.item)
                          }
                          helperText={
                            createTableItemValidation.touched.item &&
                            createTableItemValidation.errors.item
                          }
                          disabled
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">
                        Harga Beli
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="harga_beli_satuan"
                          name="harga_beli_satuan"
                          label="Harga Beli"
                          value={
                            createTableItemValidation.values.harga_beli_satuan
                          }
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched
                              .harga_beli_satuan &&
                            Boolean(
                              createTableItemValidation.errors.harga_beli_satuan
                            )
                          }
                          helperText={
                            createTableItemValidation.touched
                              .harga_beli_satuan &&
                            createTableItemValidation.errors.harga_beli_satuan
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">
                        Harga Jual
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="harga_jual_satuan"
                          name="harga_jual_satuan"
                          label="Harga Jual"
                          value={
                            createTableItemValidation.values.harga_jual_satuan
                          }
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched
                              .harga_jual_satuan &&
                            Boolean(
                              createTableItemValidation.errors.harga_jual_satuan
                            )
                          }
                          helperText={
                            createTableItemValidation.touched
                              .harga_jual_satuan &&
                            createTableItemValidation.errors.harga_jual_satuan
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Diskon</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="diskon"
                          name="diskon"
                          label="Diskon"
                          value={createTableItemValidation.values.diskon}
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.diskon &&
                            Boolean(createTableItemValidation.errors.diskon)
                          }
                          helperText={
                            createTableItemValidation.touched.diskon &&
                            createTableItemValidation.errors.diskon
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">Margin</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="margin"
                          name="margin"
                          label="Margin"
                          value={createTableItemValidation.values.margin}
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.margin &&
                            Boolean(createTableItemValidation.errors.margin)
                          }
                          helperText={
                            createTableItemValidation.touched.margin &&
                            createTableItemValidation.errors.margin
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">
                        Total Pembelian
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="total_pembelian"
                          name="total_pembelian"
                          label="Total Pembelian"
                          value={
                            createTableItemValidation.values.total_pembelian
                          }
                          onChange={createTableItemValidation.handleChange}
                          error={
                            createTableItemValidation.touched.total_pembelian &&
                            Boolean(
                              createTableItemValidation.errors.total_pembelian
                            )
                          }
                          helperText={
                            createTableItemValidation.touched.total_pembelian &&
                            createTableItemValidation.errors.total_pembelian
                          }
                        />
                      </div>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={3.5}>
                      <Typography variant="h1 font-w-600">
                        Expired Date
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <FormControl fullWidth>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              id="tanggal_ed"
                              name="tanggal_ed"
                              label="Expired Date"
                              inputFormat="dd-MM-yyyy"
                              mask="__-__-____"
                              value={
                                createTableItemValidation.values.tanggal_ed
                                  ? formatGenToIso(
                                      createTableItemValidation.values
                                        .tanggal_ed
                                    )
                                  : null
                              }
                              onChange={(newValue) => {
                                createTableItemValidation.setFieldValue(
                                  "tanggal_ed",
                                  newValue
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={
                                    createTableItemValidation.touched
                                      .tanggal_ed &&
                                    Boolean(
                                      createTableItemValidation.errors
                                        .tanggal_ed
                                    )
                                  }
                                  helperText={
                                    createTableItemValidation.touched
                                      .tanggal_ed &&
                                    createTableItemValidation.errors.tanggal_ed
                                  }
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => handleClose()}
                  variant="contained"
                  color="error"
                  sx={{ marginRight: 1 }}
                >
                  Batal
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={createTableItemValidation.isSubmitting}
                >
                  Simpan
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
