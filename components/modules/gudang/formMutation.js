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
import SelectAsync from "components/SelectAsync";
import useClientPermission from "custom-hooks/useClientPermission";
import { filterFalsyValue, convertDataDetail } from "utils/helper";
import { Divider, Typography, Button, Paper } from "@mui/material";
import DialogAddItem from "./dialogAddItemMutasi";
import TableLayoutDetailGudang from "components/TableLayoutDetailGudang";
import DialogMutasiItem from "./dialogMutasiItem";
import { getUnit } from "api/unit";
import {
  createMutation,
  deleteMutasi,
  updateMutation,
} from "api/gudang/mutasi";

const LabelToPrint = forwardRef(function LabelToPrint({ data }, ref) {
  return (
    <div ref={ref} className="printableContent">
      {/* 1cm = 37.8px */}
      {/* 1 mm: 3,78px  */}
      {/* def - w: 189px. h: 75.6px */}
      <div className="flex">
        <div
          className="flex px-4 pb-6"
          style={{
            width: "189px",
            height: "75.2px",
            flexDirection: "column",
            fontSize: "9px",
          }}
        >
          <div>
            {data.nomor_mutasi.length > 28
              ? data.nomor_mutasi.substring(0, 28) + "..."
              : data.nomor_mutasi}
          </div>
          <div className="mt-auto">
            <span className="font-w-600">TGL PO: </span>
            {formatLabelDate(data.tanggal_permintaan) || "-"}
          </div>
        </div>
        <div
          className="font-10 flex px-4 pb-6"
          style={{
            width: "189px",
            height: "75.2px",
            flexDirection: "column",
            fontSize: "9px",
            marginLeft: "7.56px",
          }}
        >
          <div>
            {data.nomor_mutasi.length > 28
              ? data.nomor_mutasi.substring(0, 28) + "..."
              : data.nomor_mutasi}
          </div>
          <div className="mt-auto">
            <span className="font-w-600">TGL PO: </span>
            {formatLabelDate(data.tanggal_permintaan) || "-"}
          </div>
        </div>
      </div>
    </div>
  );
});

const CheckupToPrint = forwardRef(function CheckupToPrint({ data }, ref) {
  return (
    <div ref={ref} className="printableContent">
      <div className="m-8">
        <div className="font-w-600">
          <div className="font-18">RSU MITRA PARAMEDIKA</div>
          <div style={{ maxWidth: "250px" }}>
            Jl. Raya Ngemplak, Kemasan, Widodomartani, Ngemplak, Sleman
          </div>
        </div>
        <div className="font-w-600 mt-24">{data.jenis_po || "-"}</div>
      </div>
    </div>
  );
});

const detailMutasiTableHead = [
  {
    id: "nomor_batch",
    label: "Nomor Batch",
  },
  {
    id: "item_kode",
    label: "Kode Item",
  },
  {
    id: "nama_item",
    label: "Nama Item",
  },
  {
    id: "jumlah",
    label: "Jumlah",
  },
  {
    id: "sediaan",
    label: "Sediaan",
  },
  {
    id: "tanggal_ed",
    label: "Tanggal ED",
  },
];

const dataDetailFormatHandler = (payload) => {
  const result = payload.map((e) => {
    return {
      nomor_batch: e.gudang ? e.gudang.nomor_batch : "null",
      item_kode: e.item.kode || "null",
      nama_item: e.item.name || "null",
      jumlah: e.jumlah || "null",
      sediaan: e.item.sediaan.name || "null",
      tanggal_ed: e.gudang ? e.gudang.tanggal_ed : "null",
      id: e.id,
    };
  });
  return result;
};

const FormMutation = ({ isEditType = false, prePopulatedDataForm = {} }) => {
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
      : () => dataDetailFormatHandler(prePopulatedDataForm.mutation_detail)
  );
  const [dataDetailEdit, setDataDetailEdit] = useState({
    item: { id: "", name: "", sediaan: { id: "", name: "" } },
    gudang: {
      id: "",
      nomor_batch: "",
      tanggal_ed: "",
    },
    jumlah: "",
  });
  const [isDialogItem, setIsDialogItem] = useState({
    state: false,
    edit: false,
  });
  const [isDialogEditItem, setIsDialogEditItem] = useState(false);

  const mutationInitialValues = !isEditType
    ? {
        tanggal_permintaan: null,
        tanggal_mutasi: null,
        unit: { id: "", name: "" },
        mutation_detail: [],
      }
    : prePopulatedDataForm;

  const createMutationSchema = Yup.object({
    tanggal_permintaan: Yup.date()
      .transform(function (value, originalValue) {
        if (this.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd/MM/yyyy", new Date());
        return result;
      })
      .typeError("Tanggal Permintaan tidak valid")
      .min("2023-01-01", "Tanggal Permintaan tidak valid")
      .required("Tanggal Permintaan wajib diisi"),
    unit: Yup.object({
      id: stringSchema("Unit", true),
    }),
    mutation_detail: Yup.array(),
  });

  const createMutationValidation = useFormik({
    initialValues: mutationInitialValues,
    validationSchema: createMutationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      let messageContext = isEditType ? "diperbarui" : "ditambahkan";
      let data = { ...values };
      data.mutation_detail = convertDataDetail(data.mutation_detail);
      try {
        let response;
        if (!isEditType) {
          data = {
            ...data,
            tanggal_permintaan: formatIsoToGen(data.tanggal_permintaan),
            unit: data.unit.id,
          };
          const formattedData = filterFalsyValue({ ...data });
          response = await createMutation(formattedData);
        } else {
          data = {
            ...data,
            tanggal_permintaan: data.tanggal_permintaan,
            tanggal_mutasi: formatIsoToGen(data.tanggal_mutasi),
            unit: data.unit.id,
          };
          const formattedData = filterFalsyValue({ ...data });
          console.log(formattedData);
          response = await updateMutation({
            ...formattedData,
            id: prePopulatedDataForm.id,
          });
        }
        setSnackbar({
          state: true,
          type: "success",
          message: `"${response.data.data.nomor_mutasi}" berhasil ${messageContext}!`,
        });

        resetForm();
      } catch (error) {
        if (Object.keys(error.errorValidationObj).length >= 1) {
          for (let key in error.errorValidationObj) {
            setFieldError(key, error.errorValidationObj[key][0]);
          }
        }
        setSnackbar({
          state: true,
          type: "error",
          message: `Terjadi kesalahan, "${response.data.data.nomor_mutasi}" gagal ${messageContext}!`,
        });
      }
    },
  });

  const createDetailDataHandler = (payload) => {
    let tempData = [...createMutationValidation.values.mutation_detail];
    const isAvailable = !isDialogItem.edit
      ? tempData.findIndex((data) => data.item.id === payload.item.id)
      : payload.index;

    if (isAvailable !== -1) {
      tempData[isAvailable] = payload;
    } else {
      tempData.push(payload);
    }
    createMutationValidation.setFieldValue("mutation_detail", tempData);
    setDataDetail(dataDetailFormatHandler(tempData));
  };

  const deleteDetailDataHandler = async (payload) => {
    if (isEditType) {
      const response = await deleteMutasi({ id: payload.data.id });
    }

    let tempData = [...createMutationValidation.values.mutation_detail];
    if (payload.index >= 0 && payload.index < tempData.length) {
      tempData.splice(payload.index, 1);
      createMutationValidation.setFieldValue("mutation_detail", tempData);
      setDataDetail(dataDetailFormatHandler(tempData));
    }
  };

  const btnEditHandler = (payload) => {
    let temp;

    if (isEditType) {
      temp = {
        ...createMutationValidation.values.mutation_detail[payload],
        index: payload,
        gudang: {
          id: "",
          nomor_batch: "",
          tanggal_ed: "",
          gudang: createMutationValidation.values.gudang,
        },
      };

      setIsDialogEditItem(true);
    } else {
      temp = {
        ...createMutationValidation.values.mutation_detail[payload],
        index: payload,
        gudang: {
          id: "",
          nomor_batch: "",
          tanggal_ed: "",
        },
      };

      setIsDialogItem({ state: true, edit: true });
    }

    console.log(temp);
    setDataDetailEdit(temp);
  };

  const updateDetailDataHandler = (payload) => {
    console.log(payload);
    let tempData = [...createMutationValidation.values.mutation_detail];
    tempData[payload.index] = payload;
    createMutationValidation.setFieldValue("mutation_detail", tempData);
    setDataDetail(dataDetailFormatHandler(tempData));
  };

  return (
    <>
      <Paper sx={{ width: "100%", paddingTop: 3 }}>
        <form onSubmit={createMutationValidation.handleSubmit}>
          <FocusError formik={createMutationValidation} />
          <div className="p-16">
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
                {isEditType && (
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="h1 font-w-600">
                        Nomor Mutasi
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <TextField
                          fullWidth
                          id="nomor_mutasi"
                          name="nomor_mutasi"
                          label="Nomor Mutasi"
                          value={createMutationValidation.values.nomor_mutasi}
                          onChange={createMutationValidation.handleChange}
                          error={
                            createMutationValidation.touched.nomor_mutasi &&
                            Boolean(
                              createMutationValidation.errors.nomor_mutasi
                            )
                          }
                          helperText={
                            createMutationValidation.touched.nomor_mutasi &&
                            createMutationValidation.errors.nomor_mutasi
                          }
                          disabled
                        />
                      </div>
                    </Grid>
                  </Grid>
                )}
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">
                      Tanggal Permintaan
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <FormControl fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            id="tanggal_permintaan"
                            name="tanggal_permintaan"
                            label="Tanggal Permintaan"
                            inputFormat="dd-MM-yyyy"
                            mask="__-__-____"
                            value={
                              createMutationValidation.values.tanggal_permintaan
                                ? formatGenToIso(
                                    createMutationValidation.values
                                      .tanggal_permintaan
                                  )
                                : null
                            }
                            onChange={(newValue) => {
                              createMutationValidation.setFieldValue(
                                "tanggal_permintaan",
                                newValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                error={
                                  createMutationValidation.touched
                                    .tanggal_permintaan &&
                                  Boolean(
                                    createMutationValidation.errors
                                      .tanggal_permintaan
                                  )
                                }
                                helperText={
                                  createMutationValidation.touched
                                    .tanggal_permintaan &&
                                  createMutationValidation.errors
                                    .tanggal_permintaan
                                }
                              />
                            )}
                            disabled={isEditType}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </div>
                  </Grid>
                </Grid>
                {isEditType && (
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="h1 font-w-600">
                        Tanggal Mutasi
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <div className="mb-16">
                        <FormControl fullWidth>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              id="tanggal_mutasi"
                              name="tanggal_mutasi"
                              label="Tanggal Mutasi"
                              inputFormat="dd-MM-yyyy"
                              mask="__-__-____"
                              value={
                                createMutationValidation.values.tanggal_mutasi
                                  ? formatGenToIso(
                                      createMutationValidation.values
                                        .tanggal_mutasi
                                    )
                                  : null
                              }
                              onChange={(newValue) => {
                                createMutationValidation.setFieldValue(
                                  "tanggal_mutasi",
                                  newValue
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={
                                    createMutationValidation.touched
                                      .tanggal_mutasi &&
                                    Boolean(
                                      createMutationValidation.errors
                                        .tanggal_mutasi
                                    )
                                  }
                                  helperText={
                                    createMutationValidation.touched
                                      .tanggal_mutasi &&
                                    createMutationValidation.errors
                                      .tanggal_mutasi
                                  }
                                />
                              )}
                              disabled={!isEditType}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </div>
                    </Grid>
                  </Grid>
                )}
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography variant="h1 font-w-600">Unit</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="mb-16">
                      <SelectAsync
                        id="unit"
                        labelField="Unit"
                        labelOptionRef="name"
                        valueOptionRef="id"
                        handlerRef={createMutationValidation}
                        handlerFetchData={getUnit}
                        handlerOnChange={(value) => {
                          if (value) {
                            createMutationValidation.setFieldValue(
                              "unit",
                              value
                            );
                          } else {
                            createMutationValidation.setFieldValue("unit", {
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
              </Grid>
            </Grid>
          </div>

          <Divider sx={{ borderWidth: "1px" }} />

          <div className="p-16">
            <TableLayoutDetailGudang
              baseRoutePath={`${router.asPath}`}
              isBtnAdd={!isEditType}
              isBtnDelete
              isEditType
              btnAddHandler={() =>
                setIsDialogItem({ state: true, edit: false })
              }
              btnEditHandler={btnEditHandler}
              btnDeleteHandler={deleteDetailDataHandler}
              tableHead={detailMutasiTableHead}
              data={dataDetail}
            />

            <DialogAddItem
              isEditType={isDialogItem.edit}
              isOpen={isDialogItem.state}
              handleClose={() => setIsDialogItem({ state: false, edit: false })}
              prePopulatedDataForm={dataDetailEdit}
              createData={createDetailDataHandler}
            />

            <DialogMutasiItem
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
                onClick={() => router.push("/gudang/mutasi")}
              >
                Kembali
              </Button>
              {isEditType ? (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  sx={{ marginRight: 2 }}
                  disabled={
                    // JSON.stringify(createMutationValidation.initialValues) ===
                    //   JSON.stringify(createMutationValidation.values) ||
                    // !isActionPermitted("mutation:update") ||
                    !isEditType
                  }
                  startIcon={<DoneIcon />}
                  loadingPosition="start"
                  loading={createMutationValidation.isSubmitting}
                >
                  Terima Mutasi
                </LoadingButton>
              ) : (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  disabled={!isActionPermitted("mutation:store")}
                  startIcon={<DoneIcon />}
                  loadingPosition="start"
                  loading={createMutationValidation.isSubmitting}
                >
                  Simpan Mutasi
                </LoadingButton>
              )}
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

export default FormMutation;
