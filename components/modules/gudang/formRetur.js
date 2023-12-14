import { useState, forwardRef, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { FocusError } from "focus-formik-error";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import PlusIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/Save";
import BackIcon from "@material-ui/icons/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import { parse } from "date-fns";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import {
  formatIsoToGen,
  formatGenToIso,
  formatReadable,
  formatLabelDate,
} from "utils/formatTime";
import { useFormik } from "formik";
import * as Yup from "yup";
import { stringSchema } from "utils/yupSchema";
import Snackbar from "components/SnackbarMui";
import useClientPermission from "custom-hooks/useClientPermission";
import { convertDataDetail, filterFalsyValue } from "utils/helper";
import { Divider, Typography, Button, Paper } from "@mui/material";
import TableLayoutDetail from "components/TableLayoutDetailGudang";
import DialogRetur from "./dialogRetur";
import { createRetur } from "api/gudang/retur";

const detailReturTableHead = [
  {
    id: "nomor_batch",
    label: "Nomor Batch",
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
    id: "stok",
    label: "Jumlah Stok",
  },
  {
    id: "jumlah_retur",
    label: "Jumlah Retur",
  },
  {
    id: "alasan",
    label: "Alasan",
  },
];

const dataDetailFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      nomor_batch: e.gudang.nomor_batch || "null",
      kode_item: e.gudang.item.kode || "null",
      nama_item: e.gudang.item.name || "null",
      stok: e.gudang.stok || "null",
      jumlah: e.jumlah || "null",
      alasan: e.alasan || "null",
      id: e.id,
    };
  });
  return result;
};

const FormRetur = ({
  isEditType = false,
  prePopulatedDataForm = {},
  handleClose = () => {},
}) => {
  const router = useRouter();
  const { isActionPermitted } = useClientPermission();
  const labelPrintRef = useRef();
  const checkupPrintRef = useRef();
  const [snackbar, setSnackbar] = useState({
    state: false,
    type: null,
    message: "",
  });
  const [dataDetail, setDataDetail] = useState(
    !isEditType
      ? []
      : () => dataDetailFormatHandler(prePopulatedDataForm.retur_detail)
  );
  const [isDialogEditItem, setIsDialogEditItem] = useState(false);
  const [dataDetailEdit, setDataDetailEdit] = useState({
    gudang: {
      id: "",
      nomor_batch: "",
      tanggal_ed: "",
      item: { id: "", name: "", sediaan: { id: "", name: "" } },
      stok: "",
    },
    jumlah: "",
    alasan: "",
  });

  const returInitialValues = !isEditType
    ? {
        receive_id: { nomor_faktur: "", supplier: { id: "", name: "" } },
        tanggal_retur: null,
        retur_detail: [],
      }
    : prePopulatedDataForm;

  const createReturSchema = Yup.object({
    tanggal_retur: Yup.date()
      .transform(function (value, originalValue) {
        if (this.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd/MM/yyyy", new Date());
        return result;
      })
      .typeError("Tanggal retur tidak valid")
      .min("2023-01-01", "Tanggal retur tidak valid")
      .required("Tanggal retur wajib diisi"),
    retur_detail: Yup.array(),
  });

  const createReturValidation = useFormik({
    initialValues: returInitialValues,
    validationSchema: createReturSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let data = { ...values };
      data.retur_detail = convertDataDetail(data.retur_detail);
      data = {
        ...data,
        receive_id: data.receive_id.id,
        tanggal_retur: formatIsoToGen(data.tanggal_retur),
      };
      try {
        let response;
        const formattedData = filterFalsyValue({ ...data });
        response = await createRetur(formattedData);

        setSnackbar({
          state: true,
          type: "success",
          message: `"${values.receive_id.nomor_faktur}" berhasil ${messageContext}!`,
        });

        resetForm();
        router.push(`/gudang/retur/${response.data.data.id}`);
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
        setSnackbar({
          state: true,
          type: "error",
          message: `Terjadi kesalahan, "${values.receive_id.nomor_faktur}" gagal di retur !`,
        });
      }
    },
  });

  const btnEditHandler = (payload) => {
    if (isEditType) {
      let temp = {
        ...createReturValidation.values.retur_detail[payload],
        index: payload,
      };
      setIsDialogEditItem(true);
      setDataDetailEdit(temp);
    }
  };

  const updateDetailDataHandler = (payload) => {
    let tempData = [...createReturValidation.values.retur_detail];
    tempData[payload.index] = payload;
    createReturValidation.setFieldValue("retur_detail", tempData);
    console.log(tempData);
    setDataDetail(dataDetailFormatHandler(tempData));
  };

  return (
    <>
      <Paper sx={{ width: "100%", paddingTop: 3 }}>
        <form onSubmit={createReturValidation.handleSubmit}>
          <FocusError formik={createReturValidation} />
          <div className="p-16">
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">
                      Nomor Faktur
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="nomor_faktur"
                        name="nomor_faktur"
                        label="Nomor Faktur"
                        value={
                          createReturValidation.values.receive_id.nomor_faktur
                        }
                        onChange={createReturValidation.handleChange}
                        error={
                          createReturValidation.touched.nomor_faktur &&
                          Boolean(createReturValidation.errors.nomor_faktur)
                        }
                        helperText={
                          createReturValidation.touched.nomor_faktur &&
                          createReturValidation.errors.nomor_faktur
                        }
                        disabled
                      />
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">
                      Tanggal Retur
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <FormControl fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            id="tanggal_retur"
                            name="tanggal_retur"
                            label="Tanggal Retur"
                            inputFormat="dd-MM-yyyy"
                            mask="__-__-____"
                            value={
                              createReturValidation.values.tanggal_retur
                                ? formatGenToIso(
                                    createReturValidation.values.tanggal_retur
                                  )
                                : null
                            }
                            onChange={(newValue) => {
                              createReturValidation.setFieldValue(
                                "tanggal_retur",
                                newValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  createReturValidation.touched.tanggal_retur &&
                                  Boolean(
                                    createReturValidation.errors.tanggal_retur
                                  )
                                }
                                helperText={
                                  createReturValidation.touched.tanggal_retur &&
                                  createReturValidation.errors.tanggal_retur
                                }
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </div>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Supplier</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <TextField
                        fullWidth
                        id="supplier"
                        name="supplier"
                        label="Nomor Faktur"
                        value={createReturValidation.values.receive_id.supplier}
                        onChange={createReturValidation.handleChange}
                        error={
                          createReturValidation.touched.nomor_faktur &&
                          Boolean(createReturValidation.errors.nomor_faktur)
                        }
                        helperText={
                          createReturValidation.touched.nomor_faktur &&
                          createReturValidation.errors.nomor_faktur
                        }
                        disabled
                      />
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>

          <Divider sx={{ borderWidth: "1px" }} />

          <div className="p-16">
            <TableLayoutDetail
              baseRoutePath={`${router.asPath}`}
              title="Item"
              isEditType
              tableHead={detailReturTableHead}
              data={dataDetail}
              btnEditHandler={btnEditHandler}
            />

            <DialogRetur
              state={isDialogEditItem}
              setState={setIsDialogEditItem}
              prePopulatedDataForm={dataDetailEdit}
              updatePrePopulatedData={updateDetailDataHandler}
            />

            <div className="flex justify-end items-center mt-16">
              <Button
                type="button"
                variant="outlined"
                startIcon={<BackIcon />}
                sx={{ marginRight: 2 }}
                onClick={() => handleClose()}
              >
                Kembali
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                disabled={!isActionPermitted("retur:store")}
                startIcon={<DoneIcon />}
                loadingPosition="start"
                loading={createReturValidation.isSubmitting}
              >
                Simpan Retur
              </LoadingButton>
            </div>
          </div>
        </form>
      </Paper>
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

export default FormRetur;
