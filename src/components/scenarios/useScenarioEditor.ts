/*
 * Copyright (c) 2025 Naval Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent, GeoPoint } from '../../types';
import { getScenario, updateScenario, createScenario } from '../../services/api';

interface InitialValues {
  isNew?: boolean;
  name?: string;
  description?: string;
  version?: string;
  tags?: string[];
  author?: string;
  timeOfDay?: string;
  date?: string;
  latitude?: string;
  longitude?: string;
  referencePosition?: GeoPoint;
  agents?: Record<string, Agent>;
}

const DEFAULT_POSITION: GeoPoint = { latitude: 1.2421, longitude: 103.7198, altitude: 0 };

export function useScenarioEditor(rawName: string | undefined, initial: InitialValues = {}) {
  const filename = rawName ? decodeURIComponent(rawName) : '';
  const isNew = initial.isNew ?? false;
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(!isNew);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial.name ?? filename);
  const [timeOfDay, setTimeOfDay] = useState(initial.timeOfDay ?? '');
  const [date, setDate] = useState(initial.date ?? '');
  const [author, setAuthor] = useState(initial.author ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [version, setVersion] = useState(initial.version ?? 'v0.0.1');
  const [tags, setTags] = useState<string[]>(initial.tags ?? []);
  const [referencePosition, setReferencePosition] = useState<GeoPoint>(() => {
    if (initial.referencePosition) return initial.referencePosition;
    const lat = parseFloat(initial.latitude ?? '');
    const lng = parseFloat(initial.longitude ?? '');
    return isNaN(lat) || isNaN(lng)
      ? DEFAULT_POSITION
      : { latitude: lat, longitude: lng, altitude: 0 };
  });
  const [agents, setAgents] = useState<Map<string, Agent>>(() =>
    initial.agents ? new Map(Object.entries(initial.agents)) : new Map()
  );
  useEffect(() => {
    if (isNew || !filename) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const scenario = await getScenario(filename);
        if (scenario) {
          setName(scenario.name || '');
          setDescription(scenario.description || '');
          setVersion(scenario.version || '');
          setTags(scenario.tags || []);
          setAuthor(scenario.author || '');
          setTimeOfDay(scenario.timeOfDay || '');
          setDate(scenario.date || '');
          if (scenario.referencePosition) setReferencePosition(scenario.referencePosition);
          const agentMap = new Map<string, Agent>(
            Array.from(scenario.agents.entries()).map(([key, agent]) => [key, Agent.from({ ...agent, name: key })])
          );
          setAgents(agentMap);
        }
      } catch {
        setError('Failed to load scenario.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filename, isNew]);

  const addAgent = useCallback((agent: Agent) => {
    setAgents((prev) => new Map(prev).set(agent.name, agent));
  }, []);

  const deleteAgent = useCallback((agentName: string) => {
    setAgents((prev) => {
      const next = new Map(prev);
      next.delete(agentName);
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!filename) return;
    setSaving(true);
    setError(null);
    try {
      const agentsObj = Object.fromEntries(agents);
      const payload = {
        name,
        agents: agentsObj,
        timeOfDay,
        date,
        referencePosition,
        author,
        description,
        version,
        tags,
      };
      let ok;
      if (!isSaved) {
        ok = await createScenario(payload);
        if (ok) setIsSaved(true);
      } else {
        ok = await updateScenario(filename, payload);
      }
      if (!ok) setError('Failed to save scenario.');
      else navigate('/scenarios');
    } catch {
      setError('Failed to save scenario.');
    } finally {
      setSaving(false);
    }
  }, [
    filename,
    name,
    agents,
    timeOfDay,
    date,
    referencePosition,
    author,
    description,
    version,
    tags,
    isSaved,
    navigate,
  ]);

  return {
    filename,
    name,
    setName,
    loading,
    saving,
    error,
    setError,
    timeOfDay,
    setTimeOfDay,
    date,
    setDate,
    author,
    setAuthor,
    description,
    setDescription,
    version,
    setVersion,
    tags,
    setTags,
    referencePosition,
    setReferencePosition,
    agents,
    addAgent,
    deleteAgent,
    save,
  };
}
