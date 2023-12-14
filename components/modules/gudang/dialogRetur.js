import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Typography,
  Snackbar,
  Divider,
  FormControl,
  Card,
  CardContent,
} from "@mui/material";
import * as Yup from "yup";
import { stringSchema } from "utils/yupSchema";
import { useFormik } from "formik";
import { FocusError } from "focus-formik-error";
import { LoadingButton } from "@mui/lab";
import useClientPermission from "custom-hooks/useClientPermission";
import { getGudang } from "api/gudang/gudang";
import TableLayoutDetail from "components/TableLayoutDetailGudang";
import { formatReadable } from "utils/formatTime";
import LoaderOnLayout from "components/LoaderOnLayout";

const DialogRetur = ({
  state,
  setState,
  prePopulatedDataForm = {},
  updatePrePopulatedData = () => "update data",
}) => {
  // const router = useRouter();
  const { isActionPermitted } = useClientPermission();
  const [snackbar, setSnackbar] = useState({
    state: false,
    type: null,
    message: "",
  });

  const createTableItemSchema = Yup.object({
    alasan: Yup.string(),
    jumlah: Yup.string()
      .matches(/^[0-9]+$/, "Wajib angka")
      .required("Jumlah wajib diisi"),
  });

  const createTableItemValidation = useFormik({
    initialValues: prePopulatedDataForm,
    validationSchema: createTableItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let data = { ...values };
      try {
        updatePrePopulatedData(data);
        resetForm();
        setState(false);
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
        setSnackbar({
          state: true,
          type: "error",
          message: `Terjadi kesalahan, "${data.item.kodex}" gagal diperbarui !`,
        });
      }
    },
  });

  return (
    <>
      <Dialog
        open={state}
        onClose={() => setState(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ paddingLeft: 2, paddingBottom: 1 }}>
          Retur Item
        </DialogTitle>
        <Divider sx={{ borderWidth: "1px" }} />
        <form onSubmit={createTableItemValidation.handleSubmit}>
          <FocusError formik={createTableItemValidation} />
          <DialogContent sx={{ paddingBottom: 2 }}>
            <div style={{ display: "flex" }}>
              <Card style={{ flex: 1, padding: "20px", marginRight: "5px" }}>
                <CardContent>
                  <div className="mt-40">
                    <Grid item xs={9} md={6}>
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
                              value={
                                createTableItemValidation.values.gudang
                                  .nomor_batch
                              }
                              onChange={createTableItemValidation.handleChange}
                              error={
                                createTableItemValidation.touched.gudang &&
                                Boolean(createTableItemValidation.errors.gudang)
                              }
                              helperText={
                                createTableItemValidation.touched.gudang &&
                                createTableItemValidation.errors.gudang
                              }
                              disabled
                            />
                          </div>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1}>
                        <Grid item xs={3.5}>
                          <Typography variant="h1 font-w-600">
                            Kode Item
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="mb-16">
                            <TextField
                              fullWidth
                              id="kode_item"
                              name="kode_item"
                              label="Kode Item"
                              value={
                                createTableItemValidation.values.gudang.item
                                  .kode
                              }
                              onChange={createTableItemValidation.handleChange}
                              error={
                                createTableItemValidation.touched.gudang &&
                                Boolean(createTableItemValidation.errors.gudang)
                              }
                              helperText={
                                createTableItemValidation.touched.gudang &&
                                createTableItemValidation.errors.gudang
                              }
                              disabled
                            />
                          </div>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1}>
                        <Grid item xs={3.5}>
                          <Typography variant="h1 font-w-600">
                            Nama Item
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="mb-16">
                            <TextField
                              fullWidth
                              id="nama_item"
                              name="nama_item"
                              label="Nama Item"
                              value={
                                createTableItemValidation.values.gudang.item
                                  .name
                              }
                              onChange={createTableItemValidation.handleChange}
                              error={
                                createTableItemValidation.touched.gudang &&
                                Boolean(createTableItemValidation.errors.gudang)
                              }
                              helperText={
                                createTableItemValidation.touched.gudang &&
                                createTableItemValidation.errors.gudang
                              }
                              disabled
                            />
                          </div>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1}>
                        <Grid item xs={3.5}>
                          <Typography variant="h1 font-w-600">
                            Jumlah
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="mb-16">
                            <TextField
                              fullWidth
                              id="jumlah"
                              name="jumlah"
                              label="Jumlah"
                              value={createTableItemValidation.values.jumlah}
                              onChange={createTableItemValidation.handleChange}
                              error={
                                createTableItemValidation.touched.jumlah &&
                                Boolean(createTableItemValidation.errors.jumlah)
                              }
                              helperText={
                                createTableItemValidation.touched.jumlah &&
                                createTableItemValidation.errors.jumlah
                              }
                            />
                          </div>
                        </Grid>
                      </Grid>
                      <Grid container spacing={1}>
                        <Grid item xs={3.5}>
                          <Typography variant="h1 font-w-600">
                            Alasan
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="mb-16">
                            <TextField
                              fullWidth
                              id="alasan"
                              name="alasan"
                              label="Alasan"
                              value={createTableItemValidation.values.alasan}
                              onChange={createTableItemValidation.handleChange}
                              error={
                                createTableItemValidation.touched.alasan &&
                                Boolean(createTableItemValidation.errors.alasan)
                              }
                              helperText={
                                createTableItemValidation.touched.alasan &&
                                createTableItemValidation.errors.alasan
                              }
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </CardContent>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => setState(false)}
                    variant="contained"
                    color="error"
                    sx={{ marginRight: 1 }}
                  >
                    Batal
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    disabled={!isActionPermitted("retur:store")}
                    loading={createTableItemValidation.isSubmitting}
                  >
                    Simpan
                  </LoadingButton>
                </div>
              </Card>
            </div>
          </DialogContent>
        </form>
        ;
      </Dialog>
      <Snackbar
        state={snackbar.state}
        setState={setSnackbar}
        message={snackbar.message}
        isSuccessType={snackbar.type === "success"}
        isErrorType={snackbar.type === "error"}
      />
    </>
  );
};

export default DialogRetur;
