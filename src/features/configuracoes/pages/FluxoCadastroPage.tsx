import React from "react";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import type { WFActivityFlow, WFFlow, WFProcess } from "@/entities/workflow";
import { useToast } from "@/shared/ui/ToastProvider";
import { useNavigate, useRouteParams } from "@/app/router";
import {
  createWFFlow,
  updateWFFlow,
  getWFFlowById,
  WFFlowActivityDto,
} from "../api/wf-flows.client";
import { fetchWFActivities } from "../api/wf-activities.client";
import { fetchWFActivityFlows } from "../api/wf-activity-flows.client";
import { fetchWFProcesses } from "../api/wf-processes.client";
import { z } from "zod";

type RouteParams = {
  flowId?: string;
};

type SelectOption = { value: number; label: string };

type TransitionDraft = {
  id?: number;
  description: string;
  fromId: number | "" | "__null";
  toId: number | "";
  initialActivity: boolean;
};

type FlowFormValues = {
  description: string;
  activityIds: number[];
  transitions: TransitionDraft[];
};

type TransitionError = {
  fromId?: string;
  toId?: string;
  description?: string;
};

type FieldErrors = {
  description?: string;
  activityIds?: string;
  transitions: Record<number, TransitionError>;
};

const INITIAL_VALUES: FlowFormValues = {
  description: "",
  activityIds: [],
  transitions: [],
};

const EMPTY_ERRORS: FieldErrors = {
  description: undefined,
  activityIds: undefined,
  transitions: {},
};

const transitionSchema = z.object({
  id: z.number().optional(),
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição para a transição."),
  fromId: z.union([z.literal(""), z.literal("__null"), z.number()]),
  toId: z.union([z.literal(""), z.number()]),
  initialActivity: z.boolean(),
});

const fluxoSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, "Informe uma descrição para o fluxo."),
    activityIds: z
      .array(z.number())
      .nonempty("Selecione pelo menos uma atividade."),
    transitions: z.array(transitionSchema),
  })
  .superRefine((data, ctx) => {
    data.transitions.forEach((transition, index) => {
      if (
        transition.fromId !== "" &&
        transition.fromId !== "__null" &&
        typeof transition.fromId === "number" &&
        !data.activityIds.includes(Number(transition.fromId))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transitions", index, "fromId"],
          message: "Atividade de inválida.",
        });
      }
      if (
        transition.toId === "" ||
        (typeof transition.toId === "number" &&
          !data.activityIds.includes(Number(transition.toId)))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transitions", index, "toId"],
          message: "Selecione uma atividade de destino válida.",
        });
      }
    });

    const initialCount = data.transitions.filter(
      (transition) => (transition.fromId === "__null" || transition.fromId === "")
    ).length;
    if (initialCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transitions"],
        message: "Apenas uma atividade pode ser inicial.",
      });
    }
  });

function resolveBackendError(error: any, fallback: string) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  const errors = data?.errors;
  if (Array.isArray(errors)) {
    return errors.join(" | ") || fallback;
  }
  if (errors && typeof errors === "object") {
    const collected = Object.values(errors)
      .flat()
      .filter(Boolean) as string[];
    if (collected.length) {
      return collected.join(" | ");
    }
  }
  return data?.message ?? fallback;
}

export default function FluxoCadastroPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useRouteParams<RouteParams>();
  const flowId = params.flowId ? Number(params.flowId) : null;
  const isEditing = Number.isFinite(flowId);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formValues, setFormValues] =
    React.useState<FlowFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] =
    React.useState<FieldErrors>(EMPTY_ERRORS);
  const [activityOptions, setActivityOptions] = React.useState<SelectOption[]>(
    []
  );
  const [existingActivityFlows, setExistingActivityFlows] = React.useState<
    WFActivityFlow[]
  >([]);
  const [flowReference, setFlowReference] = React.useState<WFFlow | null>(null);

  const loadActivities = React.useCallback(async () => {
    const response = await fetchWFActivities({ page: 1, pageSize: 1000 });
    setActivityOptions(
      response.items.map((activity: WFFlowActivityDto) => ({
        value: activity.id,
        label: activity.description,
      }))
    );
  }, []);

  const loadFlowDetails = React.useCallback(async () => {
    if (!flowId) return;
    setIsLoading(true);
    try {
      const [currentFlow, activityFlowsResponse, processesResponse] =
        await Promise.all([
          getWFFlowById(flowId),
          fetchWFActivityFlows({ page: 1, pageSize: 500, flowId }),
          fetchWFProcesses({ page: 1, pageSize: 500, flowId }),
        ]);
      setFlowReference(currentFlow);
      setExistingActivityFlows(activityFlowsResponse.items);

      setFormValues({
        description: currentFlow?.description ?? "",
        activityIds: activityFlowsResponse.items.map((item: WFFlowActivityDto) => item.activityId),
        transitions: processesResponse.items.map((process: WFProcess) => ({
          id: process.id,
          description: process.description,
          fromId:
            process.activityFromId === null
              ? "__null"
              : process.activityFromId ?? "",
          toId: process.activityToId ?? "",
          initialActivity: process.initialActivity,
        })),
      });
      setFieldErrors(EMPTY_ERRORS);
    } catch (error: any) {
      const message = resolveBackendError(
        error,
        "Não foi possível carregar o fluxo."
      );
      showToast({
        title: "Ops!",
        description: message,
        variant: "destructive",
      });
      navigate("/configuracoes/fluxos");
    } finally {
      setIsLoading(false);
    }
  }, [flowId, navigate, showToast]);

  React.useEffect(() => {
    loadActivities().catch((error) => {
      const message = resolveBackendError(
        error,
        "Não foi possível carregar as atividades."
      );
      showToast({
        title: "Ops!",
        description: message,
        variant: "destructive",
      });
    });
  }, [loadActivities, showToast]);

  React.useEffect(() => {
    if (isEditing) {
      loadFlowDetails().catch((error) => {
        const message = resolveBackendError(
          error,
          "Falha ao carregar os dados do fluxo."
        );
        showToast({
          title: "Ops!",
          description: message,
          variant: "destructive",
        });
      });
    } else {
      setFormValues(INITIAL_VALUES);
      setExistingActivityFlows([]);
      setFlowReference(null);
      setFieldErrors(EMPTY_ERRORS);
    }
  }, [isEditing, loadFlowDetails, showToast]);

  const handleActivityToggle = (id: number) => {
    setFormValues((prev) => {
      const exists = prev.activityIds.includes(id);
      const nextActivities = exists
        ? prev.activityIds.filter((activityId) => activityId !== id)
        : [...prev.activityIds, id];
      return {
        ...prev,
        activityIds: nextActivities,
        transitions: prev.transitions.filter((transition) => {
          const fromValid =
            transition.fromId === "" ||
            transition.fromId === "__null" ||
            nextActivities.includes(Number(transition.fromId));
          const toValid =
            transition.toId !== "" &&
            nextActivities.includes(Number(transition.toId));
          return fromValid && toValid;
        }),
      };
    });
  };

  const handleTransitionChange = (
    index: number,
    patch: Partial<TransitionDraft>
  ) => {
    setFormValues((prev) => ({
      ...prev,
      transitions: prev.transitions.map((transition, idx) => {
        if (idx !== index) return transition;
        const next: TransitionDraft = { ...transition, ...patch };
        if (Object.prototype.hasOwnProperty.call(patch, "fromId")) {
          next.initialActivity = next.fromId === "__null";
        }
        return next;
      }),
    }));
  };

  const handleAddTransition = () => {
    if (selectedActivities.length < 1) {
      showToast({
        title: "Transições",
        description: "Selecione ao menos uma atividade para criar transições.",
        variant: "destructive",
      });
      return;
    }

    const hasInitial = formValues.transitions.some(
      (transition) => transition.fromId === "__null"
    );

    setFormValues((prev) => ({
      ...prev,
      transitions: [
        ...prev.transitions,
        {
          description: "",
          fromId: hasInitial ? "" : "__null",
          toId: "",
          initialActivity: !hasInitial,
        },
      ],
    }));
  };

  const handleRemoveTransition = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((_, idx) => idx !== index),
    }));
  };

  const validateForm = () => {
    const parseResult = fluxoSchema.safeParse(formValues);
    if (parseResult.success) {
      setFieldErrors(EMPTY_ERRORS);
      return true;
    }

    const nextErrors: FieldErrors = {
      description: undefined,
      activityIds: undefined,
      transitions: {},
    };
    const generalMessages: string[] = [];

    parseResult.error.issues.forEach((issue) => {
      const [first, second, third] = issue.path;

      if (first === "description") {
        nextErrors.description = issue.message;
        return;
      }

      if (first === "activityIds") {
        nextErrors.activityIds = issue.message;
        return;
      }

      if (first === "transitions" && typeof second === "number") {
        const current = nextErrors.transitions[second] ?? {};
        if (typeof third === "string") {
          current[third as keyof TransitionError] = issue.message;
        } else {
          current.description = issue.message;
        }
        nextErrors.transitions[second] = current;
        return;
      }

      generalMessages.push(issue.message);
    });

    setFieldErrors(nextErrors);

    if (generalMessages.length) {
      showToast({
        title: "Validação",
        description: generalMessages.join(" | "),
        variant: "destructive",
      });
    }

    return false;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const valid = validateForm();
    if (!valid) {
      return;
    }
    setIsSaving(true);

    const activityFlowsPayload = formValues.activityIds.map((activityId) => {
      const existing = existingActivityFlows.find(
        (item) => item.activityId === activityId
      );
      return {
        id: existing?.id,
        activityId,
        flowId,
        description:
          existing?.description ??
          activityOptions.find((option) => option.value === activityId)?.label ??
          "",
      };
    });

    const processesPayload = formValues.transitions.map((transition) => ({
      id: transition.id,
      description: transition.description.trim() || "Transição de fluxo",
      activityFromId:
        transition.fromId === "" || transition.fromId === "__null"
          ? null
          : Number(transition.fromId),
      activityToId: Number(transition.toId),
      initialActivity: transition.fromId === "" || transition.fromId === "__null" ? true : false,
    }));

    const payload = {
      description: formValues.description.trim(),
      activityFlows: activityFlowsPayload,
      processes: processesPayload,
    };

    try {
      let id = flowId;
      if (id) {
        await updateWFFlow(id, payload);
      } else {
        const created = await createWFFlow(payload);
        id = created.id;
      }

      showToast({
        title: "Fluxo salvo com sucesso",
        description: "As atividades e transições foram atualizadas.",
      });
      navigate("/configuracoes/fluxos");
    } catch (error: any) {
      const message = resolveBackendError(
        error,
        "Não foi possível salvar o fluxo."
      );
      showToast({
        title: "Ops!",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedActivities = React.useMemo(
    () =>
      activityOptions.filter((option) =>
        formValues.activityIds.includes(option.value)
      ),
    [activityOptions, formValues.activityIds]
  );

  const canAddTransition = selectedActivities.length >= 1;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">

      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          {isEditing ? "Editar fluxo" : "Novo fluxo"}
        </p>
        <p className="text-sm text-stone-500">
          Selecione as atividades participantes e configure as transições entre
          elas.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-stone-500 shadow-sm">
          Carregando fluxo...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
              Descrição do fluxo
              <input
                type="text"
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Ex.: Fluxo padrão de aprovação"
                className={`rounded-2xl border px-4 py-2 text-sm text-stone-900 outline-none transition ${
                  fieldErrors.description
                    ? "border-red-300 focus:border-red-500"
                    : "border-stone-200 focus:border-emerald-500"
                }`}
              />
              {fieldErrors.description ? (
                <span className="text-xs text-red-500">
                  {fieldErrors.description}
                </span>
              ) : null}
            </label>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Atividades do fluxo
                </p>
                <span className="text-xs text-stone-500">
                  {selectedActivities.length} selecionada(s)
                </span>
              </div>
            </header>
            <div
              className={`max-h-60 overflow-y-auto rounded-2xl border bg-stone-50/70 p-3 ${
                fieldErrors.activityIds ? "border-red-300" : "border-stone-100"
              }`}
            >
              {activityOptions.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Cadastre atividades antes de criar um fluxo.
                </p>
              ) : (
                <div className="space-y-2">
                  {activityOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-stone-700 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formValues.activityIds.includes(
                            option.value
                          )}
                          onChange={() => handleActivityToggle(option.value)}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span>{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.activityIds ? (
              <p className="mt-2 text-xs text-red-500">
                {fieldErrors.activityIds}
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white px-4 py-5 shadow-sm sm:px-6">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Tramitação
                </p>
                <span className="text-xs text-stone-500">
                  Defina como as atividades se conectam.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddTransition}
                disabled={!canAddTransition}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Nova transição
              </button>
            </header>

            {formValues.transitions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-center text-xs text-stone-500">
                {canAddTransition
                  ? "Nenhuma transição adicionada ainda."
                  : "Selecione ao menos uma atividade para criar transições."}
              </p>
            ) : (
              <div className="space-y-3">
                {formValues.transitions.map((transition, index) => {
                  const transitionError = fieldErrors.transitions[index] ?? {};
                  const hasTransitionError = Boolean(
                    transitionError.fromId ||
                      transitionError.toId ||
                      transitionError.description
                  );
                  return (
                    <div
                      key={transition.id ?? `transition-${index}`}
                      className={`rounded-2xl border p-4 shadow-sm sm:flex sm:flex-col sm:gap-3 lg:grid lg:grid-cols-[repeat(2,minmax(0,1fr))_1fr_auto] lg:items-start ${
                        hasTransitionError
                          ? "border-red-300"
                          : "border-stone-100"
                      }`}
                    >
                    <div className="flex flex-col gap-1 text-sm text-stone-700">
                      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        De
                      </span>
                      <select
                        value={transition.fromId}
                        onChange={(event) =>
                          handleTransitionChange(index, {
                            fromId:
                              event.target.value === ""
                                ? ""
                                : event.target.value === "__null"
                                  ? "__null"
                                  : Number(event.target.value),
                          })
                        }
                        className={`rounded-2xl border bg-white px-3 py-2 text-sm text-stone-800 outline-none transition ${
                          transitionError.fromId
                            ? "border-red-300 focus:border-red-500"
                            : "border-stone-200 focus:border-emerald-500"
                        }`}
                      >
                        <option value="">De...</option>
                        <option value="__null">Início do fluxo</option>
                        {selectedActivities.map((option) => (
                          <option key={`${option.value}-from`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {transitionError.fromId ? (
                        <span className="text-xs text-red-500">
                          {transitionError.fromId}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1 text-sm text-stone-700">
                      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        Para
                      </span>
                      <select
                        value={transition.toId}
                        onChange={(event) =>
                          handleTransitionChange(index, {
                            toId:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          })
                        }
                        className={`rounded-2xl border bg-white px-3 py-2 text-sm text-stone-800 outline-none transition ${
                          transitionError.toId
                            ? "border-red-300 focus:border-red-500"
                            : "border-stone-200 focus:border-emerald-500"
                        }`}
                      >
                        <option value="">Para...</option>
                        {selectedActivities.map((option) => (
                          <option key={`${option.value}-to`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {transitionError.toId ? (
                        <span className="text-xs text-red-500">
                          {transitionError.toId}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1 text-sm text-stone-700">
                        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                          Descrição
                        </span>
                        <input
                          type="text"
                          value={transition.description}
                          onChange={(event) =>
                            handleTransitionChange(index, {
                              description: event.target.value,
                            })
                          }
                          placeholder="Descrição"
                          className={`rounded-2xl border px-3 py-2 text-sm text-stone-800 outline-none transition ${
                            transitionError.description
                              ? "border-red-300 focus:border-red-500"
                              : "border-stone-200 focus:border-emerald-500"
                          }`}
                        />
                        {transitionError.description ? (
                          <span className="text-xs text-red-500">
                            {transitionError.description}
                          </span>
                        ) : null}
                      </div>
                    </div>

                      <div className="flex justify-end lg:justify-start">
                        <button
                          type="button"
                          onClick={() => handleRemoveTransition(index)}
                          className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-600 transition hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/configuracoes/fluxos")}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
