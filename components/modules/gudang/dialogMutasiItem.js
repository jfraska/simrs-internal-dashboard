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

const daftarItemTableHead = [
  {
    id: "checkbox",
    label: "",
  },
  {
    id: "nomor_batch",
    label: "Nomor Batch",
  },
  {
    id: "tanggal_ed",
    label: "Expired Date",
  },
  {
    id: "stok",
    label: "Stok",
  },
  {
    id: "kode_item",
    label: "Kode Item",
  },
  {
    id: "nama_item",
    label: "Nama Item",
  },
  {
    id: "gudang",
    label: "Gudang",
  },
  {
    id: "sediaan",
    label: "Sediaan",
  },
  {
    id: "harga_jual_satuan",
    label: "Harga Jual",
  },
];

const dataGudangFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      nomor_batch: e.nomor_batch || "null",
      tanggal_ed: formatReadable(e.tanggal_ed) || "null",
      stok: e.stok || "null",
      kode_item: e.item_kode || "null",
      nama_item: e.item || "null",
      gudang: e.gudang || "null",
      sediaan: e.sediaan || "null",
      harga_jual_satuan: e.harga_jual_satuan || "null",
      id: e.id,
    };
  });
  return result;
};

const DialogMutasiItem = ({
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

  // Item --general state
  const [dataItem, setDataItem] = useState([]);
  const [isLoadingDataItem, setIsLoadingDataItem] = useState(false);

  const initDataItem = async () => {
    try {
      setIsLoadingDataItem(true);
      const params = {
        search: {
          item: prePopulatedDataForm.item.id,
          gudang: prePopulatedDataForm.gudang.gudang,
        },
      };
      const response = await getGudang(params);
      const result = dataGudangFormatHandler(response.data.data);
      setDataItem(result);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingDataItem(false);
    }
  };

  const createTableItemSchema = Yup.object({
    item: Yup.object({
      id: stringSchema("Kode Item", true),
    }),
    gudang: Yup.object({
      id: stringSchema("nomor_batch", true),
    }),
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
          message: `Terjadi kesalahan, "${data.item.kode}" gagal diperbarui !`,
        });
      }
    },
  });

  const updateHandler = (payload) => {
    createTableItemValidation.setFieldValue("gudang", dataItem[payload]);
  };

  useEffect(() => {
    if (state) {
      initDataItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <Dialog
        open={state}
        onClose={() => setState(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ paddingLeft: 2, paddingBottom: 1 }}>
          Mutasi Item
        </DialogTitle>
        <Divider sx={{ borderWidth: "1px" }} />
        {isLoadingDataItem ? (
          <LoaderOnLayout />
        ) : (
          <DialogContent sx={{ paddingBottom: 2 }}>
            <div style={{ display: "flex" }}>
              <Card style={{ flex: 1, padding: "20px", marginRight: "5px" }}>
                <CardContent>
                  <form onSubmit={createTableItemValidation.handleSubmit}>
                    <FocusError formik={createTableItemValidation} />
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
                                onChange={
                                  createTableItemValidation.handleChange
                                }
                                error={
                                  createTableItemValidation.touched.gudang &&
                                  Boolean(
                                    createTableItemValidation.errors.gudang
                                  )
                                }
                                helperText={
                                  createTableItemValidation.touched.gudang &&
                                  createTableItemValidation.errors.gudang
                                }
                              />
                            </div>
                          </Grid>
                        </Grid>
                        <Grid container spacing={1}>
                          <Grid item xs={3.5}>
                            <Typography variant="h1 font-w-600">
                              Tanggal ED
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <div className="mb-16">
                              <TextField
                                fullWidth
                                id="tanggal_ed"
                                name="tanggal_ed"
                                label="Tanggal ED"
                                value={
                                  createTableItemValidation.values.gudang
                                    .tanggal_ed
                                }
                                onChange={
                                  createTableItemValidation.handleChange
                                }
                                error={
                                  createTableItemValidation.touched.gudang &&
                                  Boolean(
                                    createTableItemValidation.errors.gudang
                                  )
                                }
                                helperText={
                                  createTableItemValidation.touched.gudang &&
                                  createTableItemValidation.errors.gudang
                                }
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
                                onChange={
                                  createTableItemValidation.handleChange
                                }
                                error={
                                  createTableItemValidation.touched.jumlah &&
                                  Boolean(
                                    createTableItemValidation.errors.jumlah
                                  )
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
                                  createTableItemValidation.values.item.kode
                                }
                                onChange={
                                  createTableItemValidation.handleChange
                                }
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
                                  createTableItemValidation.values.item.name
                                }
                                onChange={
                                  createTableItemValidation.handleChange
                                }
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
                              Sediaan
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <div className="mb-16">
                              <TextField
                                fullWidth
                                id="sediaan"
                                name="sediaan"
                                label="Sediaan"
                                value={
                                  createTableItemValidation.values.item.sediaan
                                    .name
                                }
                                onChange={
                                  createTableItemValidation.handleChange
                                }
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
                      </Grid>
                      <div
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
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
                          disabled={!isActionPermitted("pembelian:store")}
                          loading={createTableItemValidation.isSubmitting}
                        >
                          Simpan
                        </LoadingButton>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card style={{ flex: 1, padding: "20px", marginRight: "5px" }}>
                <CardContent>
                  <TableLayoutDetail
                    isEditType
                    isCheckbox={"single"}
                    checkboxHandler={updateHandler}
                    tableHead={daftarItemTableHead}
                    data={dataItem}
                  />
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        )}
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

export default DialogMutasiItem;
